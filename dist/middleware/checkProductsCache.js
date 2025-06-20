"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProductsCache = void 0;
const generateProductsCacheKey_1 = require("../features/product/utils/generateProductsCacheKey");
const cache_1 = require("../common/libs/cache");
const ResponseHandler_1 = require("../common/exceptions/ResponseHandler");
const checkProductsCache = (req, res, next) => {
    const cacheKey = (0, generateProductsCacheKey_1.generateProductsCacheKey)(req);
    req.cacheKey = cacheKey;
    const cachedData = cache_1.cache.get(cacheKey);
    if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Products from cache", cachedData);
    }
    console.log(`Cache miss for ${cacheKey}, proceeding...`);
    next();
};
exports.checkProductsCache = checkProductsCache;
