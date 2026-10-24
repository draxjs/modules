export default class VerificationResendRateLimiter {
    private readonly entries = new Map<string, {attempts: number, expiresAt: number}>();

    constructor(
        private readonly limit = 10,
        private readonly windowMs = 15 * 60 * 1000,
        private readonly maxEntries = 10000,
    ) {}

    allow(ip: string, now = Date.now()): boolean {
        const existing = this.entries.get(ip);
        if (existing && existing.expiresAt > now) {
            if (existing.attempts >= this.limit) return false;
            existing.attempts++;
            return true;
        }
        this.entries.delete(ip);
        if (this.entries.size >= this.maxEntries) {
            for (const [key, entry] of this.entries) {
                if (entry.expiresAt <= now) this.entries.delete(key);
            }
            // Fail closed instead of evicting live entries and allowing an IP to bypass its quota.
            if (this.entries.size >= this.maxEntries) return false;
        }
        this.entries.set(ip, {attempts: 1, expiresAt: now + this.windowMs});
        return true;
    }
}
