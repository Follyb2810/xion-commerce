"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../utils/cache");
const checkCache = (keyGenerator) => (req, res, next) => {
    const key = keyGenerator ? keyGenerator(req) : req.originalUrl;
    const cachedData = cache_1.cache.get(key);
    if (cachedData) {
        console.log(`Cache hit for key: ${key}`);
        return res.status(200).json({ source: "cache", data: cachedData });
    }
    console.log(`Cache miss for key: ${key}`);
    req.cacheKey = key;
    next();
};
exports.default = checkCache;
// router.get(
//   '/:productId',
//   checkCache((req) => `product:${req.params.productId}`),
//   getProductById
// );
// cache.del(key);
