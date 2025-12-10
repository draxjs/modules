
export interface ICacheAdapter<T> {
    set(k: string, v: T, ttl?: number): Promise<void>;
    get(k: string): Promise<T | undefined>;
    has(k: string): Promise<boolean>;
    delete(k: string): Promise<boolean>;
    clear(): Promise<void>;
}
