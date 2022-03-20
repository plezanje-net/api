import { BaseRedisCache } from 'apollo-server-cache-redis';
import { BaseRedisCacheOptions } from 'apollo-server-cache-redis/dist/BaseRedisCache';

export class CacheControlService {
  cache: BaseRedisCache;

  init(options: BaseRedisCacheOptions): BaseRedisCache {
    this.cache = new BaseRedisCache(options);
    return this.cache;
  }

  flush() {
    this.cache.flush();
  }
}
