import NodeCache from "node-cache";
export const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  maxKeys: -1,
});

export function setCache<T>(key: string | undefined, data: T, ttl: number = 600): boolean {
  if (!key || !data) return false;
  
  try {
    const cacheData = JSON.parse(JSON.stringify(data));
    const success = cache.set(key, cacheData, ttl);
    console.log(`Cache set for ${key}:`, success ? "✅ Success" : "❌ Failed");
    return success;
  } catch (error) {
    console.error(`Caching failed for ${key}:`, error);
    return false;
  }
}

export function invalidateCache(keys: string | string[]): void {
  const keysArray = Array.isArray(keys) ? keys : [keys];
  keysArray.forEach(key => {
    cache.del(key);
    console.log(`Cache invalidated for ${key}`);
  });
}


// invalidateCache([`products-${productId}`, "all-products"]);