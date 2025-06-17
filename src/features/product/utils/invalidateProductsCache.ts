import { cache } from "../../../common/libs/cache";

export function invalidateProductsCache() {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.startsWith("products")) {
      cache.del(key);
      console.log(`Invalidated cache key: ${key}`);
    }
  });
}
