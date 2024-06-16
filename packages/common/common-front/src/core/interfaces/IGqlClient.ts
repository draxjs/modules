import type {IHttpHeader} from "@/core/interfaces/IHttpClient";

interface IGqlOptions {
  headers: IHttpHeader;
}

interface IGqlClient {
    query( query: string, variables?: object, options?: IGqlOptions): Promise<any>
    mutation( query: string, variables?: object, options?: IGqlOptions): Promise<any>
    addHeader(name: string, value: string): void
    removeHeader(name: string): void
}

export type {IGqlClient, IGqlOptions}
