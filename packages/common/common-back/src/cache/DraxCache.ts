import { ICacheAdapter } from '../interfaces/ICacheAdapter.js';
import LocalCacheAdapter from './LocalCacheAdapter.js';
import RedisCacheAdapter from './RedisCacheAdapter.js';
import {DraxConfig} from "../config/DraxConfig.js";
import CommonConfig from "../config/CommonConfig.js";

const TTL_DEFAULT = DraxConfig.getOrLoad(CommonConfig.DraxCacheTTL, 'number',10000)
const REDIS_URL = DraxConfig.getOrLoad(CommonConfig.DraxCacheRedisURL,'string',undefined);

class DraxCache<T> {
    private adapter: ICacheAdapter<T>;
    private redisAdapter?: RedisCacheAdapter<T>;
    private ttl: number;

    constructor(ttl: number = TTL_DEFAULT) {
        this.ttl = ttl;
        const redisUrl = REDIS_URL;

        if (redisUrl) {
            this.redisAdapter = new RedisCacheAdapter<T>(redisUrl, ttl);
            this.adapter = this.redisAdapter;
        } else {
            this.adapter = new LocalCacheAdapter<T>(ttl);
        }
    }

    async set(k: string, v: T, ttl?: number): Promise<void> {
        return this.adapter.set(k, v, ttl);
    }

    async get(k: string): Promise<T | undefined> {
        return this.adapter.get(k);
    }

    async has(k: string): Promise<boolean> {
        return this.adapter.has(k);
    }

    async delete(k: string): Promise<boolean> {
        return this.adapter.delete(k);
    }

    async clear(): Promise<void> {
        return this.adapter.clear();
    }

    async getOrLoad(k: string, loader: (key: string) => Promise<T>, ttl?: number): Promise<T | undefined> {
        if (!(await this.has(k))) {
            try {
                const effectiveTTL = ttl ?? this.ttl;
                const value = await loader(k);
                if (value !== undefined) {
                    await this.set(k, value, effectiveTTL);
                }
                return value;
            } catch (error) {
                console.error('Error loading value for key:', k, error);
                throw error;
            }
        }
        return this.get(k);
    }

    isUsingRedis(): boolean {
        return this.redisAdapter?.isUsingRedis() ?? false;
    }

    isUsingFallback(): boolean {
        return this.redisAdapter?.isUsingFallback() ?? false;
    }

    getCacheStatus(): string {
        if (!this.redisAdapter) {
            return 'LOCAL_CACHE';
        }
        if (this.redisAdapter.isUsingRedis()) {
            return 'REDIS_CONNECTED';
        }
        return 'REDIS_FALLBACK_TO_LOCAL';
    }
}

export default DraxCache;
export { DraxCache };
