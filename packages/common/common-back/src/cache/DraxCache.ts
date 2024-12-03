class DraxCache<T> {
    private data: Map<string, T>;
    private timers: Map<string, NodeJS.Timeout>;
    private ttl: number;

    constructor(ttl: number = 10000) {
        this.data = new Map<string, T>();
        this.timers = new Map<string, NodeJS.Timeout>();
        this.ttl = ttl;
    }

    set(k: string, v: T, ttl?: number): void {
        if (this.timers.has(k)) {
            clearTimeout(this.timers.get(k) as NodeJS.Timeout);
        }
        const effectiveTTL = ttl ?? this.ttl;
        const timer = setTimeout(() => this.delete(k), effectiveTTL);
        this.timers.set(k, timer);
        this.data.set(k, v);
    }

    get(k: string): T | undefined {
        return this.data.get(k);
    }

    has(k: string): boolean {
        return this.data.has(k);
    }

    delete(k: string): boolean {
        if (this.timers.has(k)) {
            clearTimeout(this.timers.get(k) as NodeJS.Timeout);
        }
        this.timers.delete(k);
        return this.data.delete(k);
    }

    clear(): void {
        this.data.clear();
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
    }

    async getOrLoad(k: string, loader: (key: string) => Promise<T>, ttl?: number): Promise<T | undefined> {
        if (!this.data.has(k)) {
            try {
                const effectiveTTL = ttl ?? this.ttl;
                const value = await loader(k);
                if (value !== undefined) {
                    this.set(k, value, effectiveTTL);
                }
                return value;
            } catch (error) {
                console.error('Error loading value for key:', k, error);
                throw error;
            }
        }
        return this.data.get(k);
    }
}

export default DraxCache;
