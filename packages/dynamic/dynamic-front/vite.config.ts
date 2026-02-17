import {resolve} from "node:path";
import {defineConfig} from 'vite'
import {fileURLToPath} from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "@drax/dynamic-front",
            fileName: "drax-dynamic-front",
        },

    },
});
