import {fileURLToPath} from 'node:url'
import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
    environment: 'jsdom',
    server: {deps: {inline: ['vuetify']}},
    include: ['test/**/*.test.ts'],
    clearMocks: true,
  },
})
