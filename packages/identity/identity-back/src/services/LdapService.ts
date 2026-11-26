import {Client, DN, EqualityFilter, InvalidCredentialsError, NoSuchObjectError} from 'ldapts';
import {z} from 'zod';
import {ldapConfig, ldapEnabled} from '../config/LdapConfig.js';
import BadCredentialsError from '../errors/BadCredentialsError.js';
import LdapUnavailableError from '../errors/LdapUnavailableError.js';

export type LdapIdentity = {
    dn: string;
    username: string;
    name: string;
    email?: string;
    // Null signals that several groups matched the same primary group ID.
    groupName?: string | null;
};

export default class LdapService {
    async authenticate(username: string, password: string): Promise<LdapIdentity> {
        if (!ldapEnabled() || typeof username !== 'string' || !username.trim() || username.length > 256
            || /[\0\r\n]/.test(username) || typeof password !== 'string' || !password.trim()) {
            throw new BadCredentialsError();
        }
        const config = ldapConfig();
        const dn = `${new DN({cn: username}).toString()},${config.usersDn}`;
        const client = new Client({
            url: config.url,
            connectTimeout: 1500,
            timeout: 5000,
            tlsOptions: config.url.startsWith('ldaps:') ? {rejectUnauthorized: true} : undefined
        });
        try {
            if (config.startTLS) await client.startTLS({rejectUnauthorized: true});
            await client.bind(dn, password);
            const {searchEntries} = await client.search(dn, {
                scope: 'base', attributes: ['cn', 'mail', 'gidNumber'], sizeLimit: 1, timeLimit: 5
            });
            const entry = searchEntries.length === 1 ? searchEntries[0] : undefined;
            const canonicalName = entry && (Array.isArray(entry.cn) ? entry.cn[0] : entry.cn);
            if (typeof canonicalName !== 'string' || !canonicalName.trim() || typeof entry.dn !== 'string') throw new BadCredentialsError();
            const mail = Array.isArray(entry.mail) ? entry.mail[0] : entry.mail;
            const email = typeof mail === 'string' && z.email().safeParse(mail).success ? mail : undefined;
            const gid = Array.isArray(entry.gidNumber) ? entry.gidNumber[0] : entry.gidNumber;
            let groupName: LdapIdentity['groupName'];
            if (typeof gid === 'string' && gid) {
                const groups = await client.search(config.groupsDn, {
                    scope: 'sub', filter: new EqualityFilter({attribute: 'gidNumber', value: gid}),
                    attributes: ['cn'], sizeLimit: 2, timeLimit: 5
                });
                const cn = groups.searchEntries[0]?.cn;
                if (groups.searchEntries.length > 1) {
                    groupName = null;
                } else if (typeof cn === 'string' && cn) {
                    groupName = cn;
                }
            }
            return {dn: entry.dn, username: canonicalName, name: canonicalName, email, groupName};
        } catch (error) {
            if (error instanceof BadCredentialsError || error instanceof InvalidCredentialsError || error instanceof NoSuchObjectError) {
                throw new BadCredentialsError();
            }
            throw new LdapUnavailableError();
        } finally {
            await client.unbind().catch(() => {});
        }
    }
}
