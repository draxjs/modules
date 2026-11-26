import {execFile, spawn} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {setTimeout} from 'node:timers/promises';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('../../', import.meta.url));
const fixtures = dirname(fileURLToPath(import.meta.url));
const directory = await mkdtemp(join(tmpdir(), 'drax-ldap-integration-'));
const name = `drax-ldap-${randomUUID()}`;
const image = 'osixia/openldap@sha256:18742e9c449c9c1afe129d3f2f3ee15fb34cc43e5f940a20f3399728f41d7c28';
const docker = args => exec('docker', args, {timeout: 120000});
const ca = join(directory, 'ca.crt');
let created = false;

try {
    await exec('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2',
        '-subj', '/CN=Drax LDAP test CA', '-keyout', join(directory, 'ca.key'), '-out', ca]);
    await exec('openssl', ['req', '-new', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=localhost',
        '-keyout', join(directory, 'ldap.key'), '-out', join(directory, 'ldap.csr')]);
    await writeFile(join(directory, 'extensions'), 'subjectAltName=DNS:localhost,IP:127.0.0.1\nextendedKeyUsage=serverAuth\nbasicConstraints=CA:FALSE\n');
    await exec('openssl', ['x509', '-req', '-in', join(directory, 'ldap.csr'), '-CA', ca,
        '-CAkey', join(directory, 'ca.key'), '-CAcreateserial', '-days', '2',
        '-extfile', join(directory, 'extensions'), '-out', join(directory, 'ldap.crt')]);
    const certificates = ['ca.crt', 'ldap.crt', 'ldap.key'].flatMap(file =>
        ['-v', `${join(directory, file)}:/container/service/slapd/assets/certs/${file}:ro`]);
    await docker(['run', '-d', '--name', name, '--hostname', 'localhost',
        '-p', '127.0.0.1::389', '-p', '127.0.0.1::636',
        '-e', 'LDAP_DOMAIN=example.test', '-e', 'LDAP_ORGANISATION=Drax LDAP tests',
        '-e', 'LDAP_ADMIN_PASSWORD=Admin-Test-Only-42!', '-e', 'LDAP_TLS_VERIFY_CLIENT=never', '-e', 'LDAP_TLS=true',
        ...certificates,
        '-v', `${join(fixtures, 'access.ldif')}:/tmp/drax-test-access.ldif:ro`,
        '-v', `${join(fixtures, 'users.ldif')}:/container/service/slapd/assets/config/bootstrap/ldif/custom/50-users.ldif:ro`,
        image, '--copy-service']);
    created = true;
    const deadline = Date.now() + 60000;
    while (true) {
        try {
            await exec('docker', ['exec', '-e', 'LDAPTLS_CACERT=/container/service/slapd/assets/certs/ca.crt',
                name, 'ldapwhoami', '-x', '-H', 'ldaps://localhost',
                '-D', 'cn=ldap.user,ou=people,dc=example,dc=test', '-w', 'Directory-Test-Only-42!'], {timeout: 3000});
            break;
        } catch (error) {
            const {stdout: state} = await docker(['inspect', '--format', '{{.State.Status}}', name]);
            if (state.trim() === 'exited' || Date.now() >= deadline) {
                const logs = await docker(['logs', '--tail', '20', name]);
                throw new Error(`Test LDAP did not become ready: ${error.stderr || error.message}\n${logs.stdout}\n${logs.stderr}`);
            }
            await setTimeout(500);
        }
    }
    await docker(['exec', name, 'ldapmodify', '-Q', '-Y', 'EXTERNAL', '-H', 'ldapi:///', '-f', '/tmp/drax-test-access.ldif']);
    const port = async containerPort => {
        const {stdout} = await docker(['port', name, `${containerPort}/tcp`]);
        const value = stdout.trim().split(':').pop();
        if (!/^\d+$/.test(value)) throw new Error('Invalid test LDAP published port');
        return value;
    };
    const plainPort = await port(389);
    const tlsPort = await port(636);
    for (const engine of ['sqlite', 'mongo']) {
        console.log(`LDAP integration: real OpenLDAP, HTTP, Drax and ${engine}`);
        const result = await new Promise((resolve, reject) => {
            const child = spawn(process.execPath, [fileURLToPath(import.meta.resolve('vitest/vitest.mjs')),
                'run', '--config', 'tools/ldap/vitest.config.ts'], {cwd: root, stdio: 'inherit', env: {
                ...process.env, NODE_EXTRA_CA_CERTS: ca, LDAP_TEST_DB_ENGINE: engine,
                DRAX_LDAP_DEFAULT_ROLE: 'Desarrollo',
                LDAP_TEST_URL: `ldap://localhost:${plainPort}`, LDAP_TEST_TLS_URL: `ldaps://localhost:${tlsPort}`
            }});
            child.on('error', reject);
            child.on('exit', code => resolve(code));
        });
        if (result !== 0) throw new Error(`LDAP integration failed for ${engine} (exit ${result})`);
    }
    const untrustedEnvironment = {...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0',
        LDAP_TEST_TLS_URL: `ldaps://localhost:${tlsPort}`, LDAP_TEST_CA: ca};
    delete untrustedEnvironment.NODE_EXTRA_CA_CERTS;
    const untrusted = await exec(process.execPath, ['tools/ldap/untrusted-tls.mjs'], {cwd: root, env: untrustedEnvironment});
    console.log(untrusted.stdout.trim());
} finally {
    if (created) await docker(['rm', '-f', name]);
    await rm(directory, {recursive: true, force: true});
}
