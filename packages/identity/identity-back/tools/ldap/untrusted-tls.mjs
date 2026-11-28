import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Client} from 'ldapts';
import {DraxConfig} from '@drax/common-back';
import LdapService from '../../dist/services/LdapService.js';

const url = process.env.LDAP_TEST_TLS_URL;
assert.ok(url && process.env.LDAP_TEST_CA);
const control = new Client({url, timeout: 5000, tlsOptions: {
    ca: await readFile(process.env.LDAP_TEST_CA), rejectUnauthorized: true
}});
try {
    await control.bind('cn=ldap.user,ou=people,dc=example,dc=test', 'Directory-Test-Only-42!');
} finally { await control.unbind(); }
for (const [key, value] of Object.entries({DRAX_LDAP_ENABLED: 'true', DRAX_LDAP_URL: url,
    DRAX_LDAP_USERS_DN: 'ou=people,dc=example,dc=test', DRAX_LDAP_GROUPS_DN: 'ou=group,dc=example,dc=test'})) {
    DraxConfig.set(key, value);
}
await assert.rejects(new LdapService().authenticate('ldap.user', 'Directory-Test-Only-42!'), {statusCode: 503});
console.log('Compiled LDAP transport rejected an untrusted certificate despite the global TLS opt-out');
