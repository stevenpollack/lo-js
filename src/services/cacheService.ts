import NodeCache from 'node-cache';

export class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;
  private readonly defaultTTL = 15 * 60; // 15 minutes in seconds

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: this.defaultTTL,
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Store references to objects instead of cloning them
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  public set(key: string, value: any, ttl: number = this.defaultTTL): boolean {
    return this.cache.set(key, value, ttl);
  }

  public del(key: string): number {
    return this.cache.del(key);
  }

  public flush(): void {
    this.cache.flushAll();
  }

  public getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }
} 
