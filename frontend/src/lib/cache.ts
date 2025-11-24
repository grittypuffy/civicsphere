interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries (optional)
}

export class SessionCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttl: number;
  private readonly maxSize?: number;

  constructor(options: CacheOptions) {
    this.ttl = options.ttl;
    this.maxSize = options.maxSize;
  }

  set(key: string, value: T): void {
    const now = Date.now();
    const expiresAt = now + this.ttl;

    // If cache is at max size, remove oldest entries
    if (this.maxSize && this.cache.size >= this.maxSize) {
      this.evictExpired();

      // If still at max size after eviction, remove oldest entry
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }
    }

    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
