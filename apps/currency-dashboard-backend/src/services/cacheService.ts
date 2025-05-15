import NodeCache from 'node-cache';
import { LoggerService } from './loggerService';

export class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;
  private readonly defaultTTL = 15 * 60; // 15 minutes in seconds
  private logger = LoggerService.getInstance().createChild('CacheService');

  private constructor() {
    this.logger.debug('Initializing cache service');
    this.cache = new NodeCache({
      stdTTL: this.defaultTTL,
      checkperiod: 60, // Check for expired keys every minute
      useClones: false, // Store references to objects instead of cloning them
    });
    this.logger.debug('Cache service initialized with TTL', {
      ttl: this.defaultTTL,
      checkPeriod: 60,
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value === undefined) {
      this.logger.debug(`Cache miss for key: ${key}`);
    } else {
      this.logger.debug(`Cache hit for key: ${key}`);
    }
    return value;
  }

  public set(key: string, value: any, ttl: number = this.defaultTTL): boolean {
    const result = this.cache.set(key, value, ttl);
    this.logger.debug(`Cache set for key: ${key}`, { ttl, result });
    return result;
  }

  public del(key: string): number {
    const count = this.cache.del(key);
    this.logger.debug(`Deleted ${count} keys from cache`, { key });
    return count;
  }

  public flush(): void {
    this.logger.info('Flushing entire cache');
    this.cache.flushAll();
  }

  public getStats(): NodeCache.Stats {
    const stats = this.cache.getStats();
    this.logger.debug('Cache stats retrieved', stats);
    return stats;
  }
}
