"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
exports.setCache = setCache;
exports.invalidateCache = invalidateCache;
const node_cache_1 = __importDefault(require("node-cache"));
exports.cache = new node_cache_1.default({
    stdTTL: 600,
    checkperiod: 120,
    maxKeys: -1,
});
function setCache(key, data, ttl = 600) {
    if (!key || !data)
        return false;
    try {
        const cacheData = JSON.parse(JSON.stringify(data));
        const success = exports.cache.set(key, cacheData, ttl);
        console.log(`Cache set for ${key}:`, success ? "✅ Success" : "❌ Failed");
        return success;
    }
    catch (error) {
        console.error(`Caching failed for ${key}:`, error);
        return false;
    }
}
function invalidateCache(keys) {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach(key => {
        exports.cache.del(key);
        console.log(`Cache invalidated for ${key}`);
    });
}
// invalidateCache([`products-${productId}`, "all-products"]);
