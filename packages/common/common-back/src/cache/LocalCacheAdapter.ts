import type { ICacheAdapter } from '../interfaces/ICacheAdapter';

class LocalCacheAdapter<T> implements ICacheAdapter<T> {
    private data: Map<string, T>;
    private timers: Map<string, NodeJS.Timeout>;
    private ttl: number;
    private keyPrefix?: string;

    constructor(ttl: number = 10000, namespace?: string) {
        this.data = new Map<string, T>();
        this.timers = new Map<string, NodeJS.Timeout>();
        this.ttl = ttl;
        this.keyPrefix = namespace;
    }

    private getStorageKey(k: string): string {
        return this.keyPrefix ? `${this.keyPrefix}${k}` : k;
    }

    async set(k: string, v: T, ttl?: number): Promise<void> {
        const storageKey = this.getStorageKey(k);
        if (this.timers.has(storageKey)) {
            clearTimeout(this.timers.get(storageKey) as NodeJS.Timeout);
        }
        const effectiveTTL = ttl ?? this.ttl;
        const timer = setTimeout(() => this.delete(k), effectiveTTL);
        this.timers.set(storageKey, timer);
        this.data.set(storageKey, v);
    }

    async get(k: string): Promise<T | undefined> {
        return this.data.get(this.getStorageKey(k));
    }

    async has(k: string): Promise<boolean> {
        return this.data.has(this.getStorageKey(k));
    }

    async delete(k: string): Promise<boolean> {
        const storageKey = this.getStorageKey(k);
        if (this.timers.has(storageKey)) {
            clearTimeout(this.timers.get(storageKey) as NodeJS.Timeout);
        }
        this.timers.delete(storageKey);
        return this.data.delete(storageKey);
    }

    async clear(): Promise<void> {
        this.data.clear();
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
    }
}

export default LocalCacheAdapter;
