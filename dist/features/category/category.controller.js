"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allCategory = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ResponseHandler_1 = require("./../../common/exceptions/ResponseHandler");
const category_service_1 = __importDefault(require("./category.service"));
const cache_1 = require("../../common/libs/cache");
exports.allCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.default.allCategory();
    if (req.cacheKey && result) {
        // console.log(JSON.stringify(result, null, 2));
        const cacheData = JSON.parse(JSON.stringify(result));
        const success = cache_1.cache.set(req.cacheKey, cacheData, 600);
        console.log(`Cache set for key ${req.cacheKey}:`, success ? "Success" : "Failed");
    }
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "All Available Category", result);
}));
