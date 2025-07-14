import { performance } from 'perf_hooks';

// Mock Redis interface for when Redis is not available
interface RedisLike {
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<string>;
  del(...keys: string[]): Promise<number>;
  mget(...keys: string[]): Promise<(string | null)[]>;
  keys(pattern: string): Promise<string[]>;
  pipeline(): any;
}

class MockRedis implements RedisLike {
  private data = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.data.get(key);
    if (item && item.expiry > Date.now()) {
      return item.value;
    }
    if (item) this.data.delete(key);
    return null;
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    this.data.set(key, { value, expiry: Date.now() + seconds * 1000 });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    keys.forEach(key => {
      if (this.data.delete(key)) deleted++;
    });
    return deleted;
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    return keys.map(key => {
      const item = this.data.get(key);
      return item && item.expiry > Date.now() ? item.value : null;
    });
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  pipeline() {
    const ops: Array<() => Promise<any>> = [];
    return {
      setex: (key: string, seconds: number, value: string) => {
        ops.push(() => this.setex(key, seconds, value));
        return this;
      },
      exec: async () => {
        return Promise.all(ops.map(op => op()));
      }
    };
  }
}

export class PerformanceOptimizer {
  private static redis: RedisLike | null = null;
  private static memoryCache = new Map<string, { data: any; expiry: number }>();
  private static metrics: Map<string, number[]> = new Map();
  
  static async initialize() {
    try {
      // Use MockRedis for development
      this.redis = new MockRedis();
      console.log('[CACHE] Cache system initialized with MockRedis');
    } catch (error) {
      console.log('[CACHE] Cache unavailable, using memory cache fallback');
      this.redis = null;
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    const start = performance.now();
    
    try {
      if (this.redis) {
        const data = await this.redis.get(key);
        this.recordMetric('cache_redis_get', performance.now() - start);
        return data ? JSON.parse(data) : null;
      } else {
        const cached = this.memoryCache.get(key);
        this.recordMetric('cache_memory_get', performance.now() - start);
        
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        } else if (cached) {
          this.memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error('[CACHE] Get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const start = performance.now();
    
    try {
      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        this.recordMetric('cache_redis_set', performance.now() - start);
      } else {
        this.memoryCache.set(key, {
          data: value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
        this.recordMetric('cache_memory_set', performance.now() - start);
        
        // Memory temizliği
        if (this.memoryCache.size > 1000) {
          this.cleanupMemoryCache();
        }
      }
    } catch (error) {
      console.error('[CACHE] Set error:', error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('[CACHE] Delete error:', error);
    }
  }

  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const start = performance.now();
    
    try {
      if (this.redis) {
        const data = await this.redis.mget(...keys);
        this.recordMetric('cache_redis_mget', performance.now() - start);
        return data.map(item => item ? JSON.parse(item) : null);
      } else {
        const results = keys.map(key => {
          const cached = this.memoryCache.get(key);
          if (cached && cached.expiry > Date.now()) {
            return cached.data;
          } else if (cached) {
            this.memoryCache.delete(key);
            return null;
          }
          return null;
        });
        this.recordMetric('cache_memory_mget', performance.now() - start);
        return results;
      }
    } catch (error) {
      console.error('[CACHE] Mget error:', error);
      return keys.map(() => null);
    }
  }

  static async mset(keyValues: Record<string, any>, ttlSeconds = 300): Promise<void> {
    const start = performance.now();
    
    try {
      if (this.redis) {
        const pipeline = this.redis.pipeline();
        Object.entries(keyValues).forEach(([key, value]) => {
          pipeline.setex(key, ttlSeconds, JSON.stringify(value));
        });
        await pipeline.exec();
        this.recordMetric('cache_redis_mset', performance.now() - start);
      } else {
        const expiry = Date.now() + (ttlSeconds * 1000);
        Object.entries(keyValues).forEach(([key, value]) => {
          this.memoryCache.set(key, { data: value, expiry });
        });
        this.recordMetric('cache_memory_mset', performance.now() - start);
      }
    } catch (error) {
      console.error('[CACHE] Mset error:', error);
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        const regex = new RegExp(pattern.replace('*', '.*'));
        const keysToDelete = Array.from(this.memoryCache.keys()).filter(key => regex.test(key));
        keysToDelete.forEach(key => this.memoryCache.delete(key));
      }
    } catch (error) {
      console.error('[CACHE] Invalidate pattern error:', error);
    }
  }

  private static cleanupMemoryCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expiry <= now) {
        this.memoryCache.delete(key);
        cleaned++;
      }
      
      if (cleaned > 100) break; // Batch cleanup
    }
    
    console.log(`[CACHE] Cleaned ${cleaned} expired entries`);
  }

  private static recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const metrics = this.metrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  static getMetrics(): Record<string, { avg: number; count: number; max: number; min: number }> {
    const result: Record<string, any> = {};
    
    for (const [operation, durations] of this.metrics.entries()) {
      if (durations.length > 0) {
        result[operation] = {
          avg: durations.reduce((a, b) => a + b, 0) / durations.length,
          count: durations.length,
          max: Math.max(...durations),
          min: Math.min(...durations)
        };
      }
    }
    
    return result;
  }
}

// Decorator for caching function results
export function Cache(ttl = 300) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}_${propertyName}_${JSON.stringify(args).slice(0, 100)}`;
      
      // Try cache first
      const cached = await PerformanceOptimizer.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // Execute method
      const result = await method.apply(this, args);
      
      // Cache result
      await PerformanceOptimizer.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

// Rate limiting
export class RateLimiter {
  private static windows = new Map<string, { count: number; resetTime: number }>();

  static async isAllowed(
    identifier: string, 
    maxRequests: number, 
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    
    const now = Date.now();
    const windowKey = `${identifier}_${Math.floor(now / (windowSeconds * 1000))}`;
    
    let window = this.windows.get(windowKey);
    if (!window) {
      window = { count: 0, resetTime: now + (windowSeconds * 1000) };
      this.windows.set(windowKey, window);
    }

    window.count++;
    
    // Cleanup old windows
    this.cleanupWindows(now);
    
    return {
      allowed: window.count <= maxRequests,
      remaining: Math.max(0, maxRequests - window.count),
      resetTime: window.resetTime
    };
  }

  private static cleanupWindows(now: number): void {
    for (const [key, window] of this.windows.entries()) {
      if (window.resetTime < now) {
        this.windows.delete(key);
      }
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startTimer(label: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMeasurement(label, duration);
      return duration;
    };
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const end = this.startTimer(label);
    try {
      const result = await fn();
      end();
      return result;
    } catch (error) {
      end();
      throw error;
    }
  }

  private static recordMeasurement(label: string, duration: number): void {
    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    
    const measurements = this.measurements.get(label)!;
    measurements.push(duration);
    
    if (measurements.length > 1000) {
      measurements.shift();
    }
  }

  static getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [label, measurements] of this.measurements.entries()) {
      if (measurements.length > 0) {
        const sorted = [...measurements].sort((a, b) => a - b);
        stats[label] = {
          count: measurements.length,
          avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)]
        };
      }
    }
    
    return stats;
  }
}

// Database query optimizer
export class QueryOptimizer {
  private static queryCache = new Map<string, any>();
  private static slowQueries: Array<{ query: string; duration: number; timestamp: number }> = [];

  static async executeWithCache<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl = 60
  ): Promise<T> {
    
    // Check cache first
    const cached = await PerformanceOptimizer.get(`query_${queryKey}`);
    if (cached) {
      return cached;
    }

    // Execute query with monitoring
    const start = performance.now();
    const result = await queryFn();
    const duration = performance.now() - start;

    // Log slow queries
    if (duration > 1000) {
      this.slowQueries.push({
        query: queryKey,
        duration,
        timestamp: Date.now()
      });
      
      if (this.slowQueries.length > 100) {
        this.slowQueries.shift();
      }
      
      console.warn(`[SLOW QUERY] ${queryKey} took ${duration.toFixed(2)}ms`);
    }

    // Cache result
    await PerformanceOptimizer.set(`query_${queryKey}`, result, ttl);
    
    return result;
  }

  static getSlowQueries() {
    return this.slowQueries;
  }
}

// Initialize performance optimizer
PerformanceOptimizer.initialize();