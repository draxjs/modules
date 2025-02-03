/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_HTTP_TRANSPORT: string
    // Add other env variables here
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
