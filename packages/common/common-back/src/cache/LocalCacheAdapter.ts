import type { ICacheAdapter } from '../interfaces/ICacheAdapter';

class LocalCacheAdapter<T> implements ICacheAdapter<T> {
    private data: Map<string, T>;
    private timers: Map<string, NodeJS.Timeout>;
    private ttl: number;

    constructor(ttl: number = 10000) {
        this.data = new Map<string, T>();
        this.timers = new Map<string, NodeJS.Timeout>();
        this.ttl = ttl;
    }

    async set(k: string, v: T, ttl?: number): Promise<void> {
        if (this.timers.has(k)) {
            clearTimeout(this.timers.get(k) as NodeJS.Timeout);
        }
        const effectiveTTL = ttl ?? this.ttl;
        const timer = setTimeout(() => this.delete(k), effectiveTTL);
        this.timers.set(k, timer);
        this.data.set(k, v);
    }

    async get(k: string): Promise<T | undefined> {
        //console.log("LocalCacheAdapter: get key:", k)
        return this.data.get(k);
    }

    async has(k: string): Promise<boolean> {
        return this.data.has(k);
    }

    async delete(k: string): Promise<boolean> {
        if (this.timers.has(k)) {
            clearTimeout(this.timers.get(k) as NodeJS.Timeout);
        }
        this.timers.delete(k);
        return this.data.delete(k);
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
