import {DraxConfig} from '@drax/common-back';
import {z} from 'zod';
import IdentityConfig from './IdentityConfig.js';
import LdapUnavailableError from '../errors/LdapUnavailableError.js';

const ldapConfigSchema = z.object({
    url: z.url().refine(value => {
        const url = new URL(value);
        return ['ldap:', 'ldaps:'].includes(url.protocol) && !url.username && !url.password
            && !url.search && !url.hash && ['', '/'].includes(url.pathname);
    }),
    usersDn: z.string().trim().min(1),
    groupsDn: z.string().trim().min(1),
    startTLS: z.boolean(),
    defaultRole: z.string().trim().min(1).optional()
}).refine(config => !config.startTLS || config.url.startsWith('ldap:'));

export function ldapEnabled(): boolean {
    return DraxConfig.getOrLoad(IdentityConfig.LdapEnabled, 'boolean', false);
}

export function ldapConfig() {
    try {
        return ldapConfigSchema.parse({
            url: DraxConfig.getOrLoad(IdentityConfig.LdapUrl),
            usersDn: DraxConfig.getOrLoad(IdentityConfig.LdapUsersDn),
            groupsDn: DraxConfig.getOrLoad(IdentityConfig.LdapGroupsDn),
            startTLS: DraxConfig.getOrLoad(IdentityConfig.LdapStartTLS, 'boolean', false),
            defaultRole: DraxConfig.getOrLoad(IdentityConfig.LdapDefaultRole)
        });
    } catch {
        throw new LdapUnavailableError();
    }
}
