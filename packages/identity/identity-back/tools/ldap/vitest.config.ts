import {defineConfig} from 'vitest/config';

export default defineConfig({test: {include: ['tools/ldap/*.integration.ts'], maxWorkers: 1, hookTimeout: 120000}});
