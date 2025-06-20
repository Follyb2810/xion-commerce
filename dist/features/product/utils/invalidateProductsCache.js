"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateProductsCache = invalidateProductsCache;
const cache_1 = require("../../../common/libs/cache");
function invalidateProductsCache() {
    const keys = cache_1.cache.keys();
    keys.forEach(key => {
        if (key.startsWith("products")) {
            cache_1.cache.del(key);
            console.log(`Invalidated cache key: ${key}`);
        }
    });
}
