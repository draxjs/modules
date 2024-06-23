import {resolve} from "node:path";
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from "vite-plugin-dts";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import {fileURLToPath} from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: { transformAssetUrls },
        }),
        vuetify({
            autoImport: true,
        }),
        dts()
    ],
    optimizeDeps: {
        include: ["vuetify"],
    },
    // resolve: {
    //     alias: {
    //         "@": fileURLToPath(new URL("./src", import.meta.url)),
    //     },
    // },
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "@drax/identity-front",
            fileName: "drax-identity-front",
        },

        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue"
                },
            },
        },
    },
});
