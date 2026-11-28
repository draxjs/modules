import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {DraxConfig} from '@drax/common-back';
import {Client, InvalidCredentialsError, NoSuchObjectError} from 'ldapts';
import LdapService from '../../src/services/LdapService.js';
import BadCredentialsError from '../../src/errors/BadCredentialsError.js';

const client = vi.hoisted(() => ({bind: vi.fn(), search: vi.fn(), unbind: vi.fn(), startTLS: vi.fn()}));
vi.mock('ldapts', async original => ({
    ...await original<typeof import('ldapts')>(),
    Client: vi.fn(function () { return client; })
}));

describe('LDAP transport', () => {
    const before = {...DraxConfig.getAll()};
    const service = new LdapService();

    beforeEach(() => {
        vi.mocked(Client).mockClear();
        for (const mock of Object.values(client)) mock.mockReset();
        DraxConfig.set('DRAX_LDAP_ENABLED', 'true');
        DraxConfig.set('DRAX_LDAP_URL', 'ldaps://directory.example.test:636');
        DraxConfig.set('DRAX_LDAP_USERS_DN', 'ou=people,dc=example,dc=test');
        DraxConfig.set('DRAX_LDAP_GROUPS_DN', 'ou=group,dc=example,dc=test');
        DraxConfig.set('DRAX_LDAP_STARTTLS', 'false');
        client.bind.mockResolvedValue(undefined);
        client.unbind.mockResolvedValue(undefined);
        client.startTLS.mockResolvedValue(undefined);
        client.search.mockResolvedValueOnce({searchEntries: [{dn: 'cn=ldap.user,ou=people,dc=example,dc=test',
            cn: 'ldap.user', mail: 'ldap.user@example.test', gidNumber: '1000'}]})
            .mockResolvedValueOnce({searchEntries: [{cn: 'Implementaciones'}]});
    });
    afterEach(() => {
        for (const key of Object.keys(DraxConfig.getAll())) delete DraxConfig.getAll()[key];
        Object.assign(DraxConfig.getAll(), before);
    });

    it('binds before searching and requests only identity attributes, never passwords', async () => {
        expect(await service.authenticate('ldap.user', '  exact LDAP password  ')).toEqual({
            dn: 'cn=ldap.user,ou=people,dc=example,dc=test', username: 'ldap.user',
            name: 'ldap.user', email: 'ldap.user@example.test', groupName: 'Implementaciones'
        });
        expect(client.bind).toHaveBeenCalledWith('cn=ldap.user,ou=people,dc=example,dc=test', '  exact LDAP password  ');
        expect(client.bind.mock.invocationCallOrder[0]).toBeLessThan(client.search.mock.invocationCallOrder[0]);
        expect(client.search.mock.calls[0][1]).toMatchObject({scope: 'base', attributes: ['cn', 'mail', 'gidNumber'], sizeLimit: 1});
        expect(client.search.mock.calls[1][1].filter.toString()).toBe('(gidNumber=1000)');
        expect(client.unbind).toHaveBeenCalledOnce();
        expect(vi.mocked(Client).mock.calls[0][0]).toMatchObject({connectTimeout: 1500, timeout: 5000});
        expect(vi.mocked(Client).mock.calls[0][0].tlsOptions?.rejectUnauthorized).toBe(true);
    });

    it('escapes the username as an RDN and the group ID as a filter value', async () => {
        client.search.mockReset().mockResolvedValueOnce({searchEntries: [{
            dn: 'cn=alice\\,admin,ou=people,dc=example,dc=test', cn: 'alice,admin',
            mail: 'alice@example.test', gidNumber: '*)(cn=*)'
        }]}).mockResolvedValueOnce({searchEntries: []});
        await service.authenticate('alice,admin', 'password');
        expect(client.bind.mock.calls[0][0]).toBe('cn=alice\\,admin,ou=people,dc=example,dc=test');
        expect(client.search.mock.calls[1][1].filter.toString()).toBe('(gidNumber=\\2a\\29\\28cn=\\2a\\29)');
    });

    it('uses the directory canonical identity when a user logs in with different case', async () => {
        const identity = await service.authenticate('LDAP.USER', 'password');
        expect(identity.username).toBe('ldap.user');
        expect(identity.dn).toBe('cn=ldap.user,ou=people,dc=example,dc=test');
    });

    it.each(['', ' ', null, {}, 42])('rejects an invalid password before binding: %j', async password => {
        await expect(service.authenticate('ldap.user', password as string)).rejects.toBeInstanceOf(BadCredentialsError);
        expect(Client).not.toHaveBeenCalled();
    });

    it('upgrades StartTLS before transmitting credentials', async () => {
        DraxConfig.set('DRAX_LDAP_URL', 'ldap://directory.example.test:389');
        DraxConfig.set('DRAX_LDAP_STARTTLS', 'true');
        await service.authenticate('ldap.user', 'password');
        expect(vi.mocked(Client).mock.calls[0][0].tlsOptions).toBeUndefined();
        expect(client.startTLS).toHaveBeenCalledWith({rejectUnauthorized: true});
        expect(client.startTLS.mock.invocationCallOrder[0]).toBeLessThan(client.bind.mock.invocationCallOrder[0]);
    });

    it('does not bind after a TLS failure and closes the connection', async () => {
        DraxConfig.set('DRAX_LDAP_URL', 'ldap://directory.example.test');
        DraxConfig.set('DRAX_LDAP_STARTTLS', 'true');
        client.startTLS.mockRejectedValue(new Error('certificate failure, sensitive upstream detail'));
        await expect(service.authenticate('ldap.user', 'password')).rejects.toMatchObject({statusCode: 503});
        expect(client.bind).not.toHaveBeenCalled();
        expect(client.unbind).toHaveBeenCalledOnce();
    });

    it.each([new InvalidCredentialsError(), new NoSuchObjectError()])('returns a neutral authentication failure', async error => {
        client.bind.mockRejectedValue(error);
        await expect(service.authenticate('ldap.user', 'wrong')).rejects.toBeInstanceOf(BadCredentialsError);
        expect(client.search).not.toHaveBeenCalled();
        expect(client.unbind).toHaveBeenCalledOnce();
    });

    it('returns a bounded technical error without exposing upstream details', async () => {
        client.bind.mockRejectedValue(new Error('password=should-not-be-exposed'));
        await expect(service.authenticate('ldap.user', 'password')).rejects.toMatchObject({
            statusCode: 503, message: 'error.ldapUnavailable'
        });
        expect(client.unbind).toHaveBeenCalledOnce();
    });

    it('fails closed when LDAP is disabled or its configuration is incomplete', async () => {
        DraxConfig.set('DRAX_LDAP_ENABLED', 'false');
        await expect(service.authenticate('ldap.user', 'password')).rejects.toBeInstanceOf(BadCredentialsError);
        DraxConfig.set('DRAX_LDAP_ENABLED', 'true');
        DraxConfig.set('DRAX_LDAP_URL', 'https://wrong.example.test');
        await expect(service.authenticate('ldap.user', 'password')).rejects.toMatchObject({statusCode: 503});
        expect(Client).not.toHaveBeenCalled();
    });
});
