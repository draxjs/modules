import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'dist/']
        },
        root: fileURLToPath(new URL('./', import.meta.url)),
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
