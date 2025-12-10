
import { RedisClientType, createClient } from 'redis';
import type { ICacheAdapter } from '../interfaces/ICacheAdapter';
import LocalCacheAdapter from './LocalCacheAdapter.js';

class RedisCacheAdapter<T> implements ICacheAdapter<T> {
    private client: RedisClientType;
    private ttl: number;
    private isConnected: boolean = false;
    private fallbackAdapter: LocalCacheAdapter<T>;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 3;
    private reconnectDelay: number = 2000;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private healthCheckFrequency: number = 30000; // Cada 30 segundos
    private operationsSinceLastCheck: number = 0;
    private operationsThresholdForCheck: number = 100; // Intentar reconectar cada 100 operaciones

    constructor(redisUrl: string, ttl: number = 10000) {
        this.ttl = ttl;
        this.fallbackAdapter = new LocalCacheAdapter<T>(ttl);
        this.client = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > this.maxReconnectAttempts) {
                        console.warn(`Max Redis reconnection attempts (${this.maxReconnectAttempts}) reached, stopping automatic reconnection`);
                        return new Error('Max reconnection attempts reached');
                    }
                    const delay = Math.min(retries * this.reconnectDelay, 30000); // Max 30 segundos
                    console.log(`Redis reconnect strategy: attempt ${retries}, waiting ${delay}ms before retry`);
                    return delay;
                },
            },
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err.message);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            console.log('Redis client connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.client.on('reconnecting', () => {
            this.reconnectAttempts++;
            console.warn(`Redis reconnecting... (attempt ${this.reconnectAttempts})`);
        });

        this.client.on('ready', () => {
            console.log('Redis client ready');
            this.isConnected = true;
        });

        this.initializeConnection();
        this.startHealthCheck();
    }

    private async initializeConnection(): Promise<void> {
        try {
            await this.client.connect();
            this.isConnected = true;
            console.log('Redis client connected successfully');
        } catch (error) {
            console.warn('Failed to connect to Redis, using local cache fallback:', (error as Error).message);
            this.isConnected = false;
        }
    }

    private startHealthCheck(): void {
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, this.healthCheckFrequency);

        // Permitir que el intervalo no bloquee el proceso
        if (this.healthCheckInterval.unref) {
            this.healthCheckInterval.unref();
        }
    }

    private async performHealthCheck(): Promise<void> {
        if (this.isConnected) {
            try {
                await this.client.ping();
                //console.log('Redis health check: OK');
            } catch (error) {
                console.warn('Redis health check failed:', (error as Error).message);
                this.isConnected = false;
                await this.attemptReconnect();
            }
        } else {
            console.log('Redis is disconnected, attempting to reconnect...');
            await this.attemptReconnect();
        }
    }

    private async attemptReconnect(): Promise<void> {
        try {
            console.log('Attempting to reconnect to Redis...');
            await this.client.connect();
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('Successfully reconnected to Redis');
        } catch (error) {
            console.warn('Reconnection attempt failed:', (error as Error).message);
            this.isConnected = false;
        }
    }

    private async checkConnectionAndReconnect(): Promise<void> {
        this.operationsSinceLastCheck++;

        // Intentar reconectar cada X operaciones si está desconectado
        if (!this.isConnected && this.operationsSinceLastCheck >= this.operationsThresholdForCheck) {
            this.operationsSinceLastCheck = 0;
            await this.attemptReconnect();
        }
    }

    async set(k: string, v: T, ttl?: number): Promise<void> {
        await this.checkConnectionAndReconnect();

        if (this.isConnected) {
            try {
                const effectiveTTL = ttl ?? this.ttl;
                const serialized = JSON.stringify(v);
                await this.client.setEx(k, Math.floor(effectiveTTL / 1000), serialized);
            } catch (error) {
                console.warn('Error setting value in Redis, falling back to local cache:', (error as Error).message);
                this.isConnected = false;
                await this.fallbackAdapter.set(k, v, ttl);
            }
        } else {
            await this.fallbackAdapter.set(k, v, ttl);
        }
    }

    async get(k: string): Promise<T | undefined> {
        await this.checkConnectionAndReconnect();

        if (this.isConnected) {
            try {
                const value = await this.client.get(k);
                if (value === null) {
                    return undefined;
                }
                try {
                    return JSON.parse(value as string) as T;
                } catch (error) {
                    console.error('Error parsing Redis value for key:', k, error);
                    return undefined;
                }
            } catch (error) {
                console.warn('Error getting value from Redis, falling back to local cache:', (error as Error).message);
                this.isConnected = false;
                return this.fallbackAdapter.get(k);
            }
        } else {
            return this.fallbackAdapter.get(k);
        }
    }

    async has(k: string): Promise<boolean> {
        await this.checkConnectionAndReconnect();

        if (this.isConnected) {
            try {
                const exists = await this.client.exists(k);
                return exists === 1;
            } catch (error) {
                console.warn('Error checking key in Redis, falling back to local cache:', (error as Error).message);
                this.isConnected = false;
                return this.fallbackAdapter.has(k);
            }
        } else {
            return this.fallbackAdapter.has(k);
        }
    }

    async delete(k: string): Promise<boolean> {
        await this.checkConnectionAndReconnect();

        if (this.isConnected) {
            try {
                const result = await this.client.del(k);
                return result === 1;
            } catch (error) {
                console.warn('Error deleting key from Redis, falling back to local cache:', (error as Error).message);
                this.isConnected = false;
                return this.fallbackAdapter.delete(k);
            }
        } else {
            return this.fallbackAdapter.delete(k);
        }
    }

    async clear(): Promise<void> {
        await this.checkConnectionAndReconnect();

        if (this.isConnected) {
            try {
                await this.client.flushDb();
            } catch (error) {
                console.warn('Error clearing Redis, falling back to local cache:', (error as Error).message);
                this.isConnected = false;
                await this.fallbackAdapter.clear();
            }
        } else {
            await this.fallbackAdapter.clear();
        }
    }

    async disconnect(): Promise<void> {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }

        if (this.isConnected) {
            try {
                await this.client.disconnect();
                this.isConnected = false;
            } catch (error) {
                console.warn('Error disconnecting from Redis:', (error as Error).message);
            }
        }
        await this.fallbackAdapter.clear();
    }

    isUsingRedis(): boolean {
        return this.isConnected;
    }

    isUsingFallback(): boolean {
        return !this.isConnected;
    }

    getConnectionStatus(): { connected: boolean; operationsSinceCheck: number; healthCheckFrequency: number } {
        return {
            connected: this.isConnected,
            operationsSinceCheck: this.operationsSinceLastCheck,
            healthCheckFrequency: this.healthCheckFrequency
        };
    }
}

export default RedisCacheAdapter;
