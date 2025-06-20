"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const checkCache_1 = __importDefault(require("../../middleware/checkCache"));
const router = (0, express_1.Router)();
router.route("/").get((0, checkCache_1.default)((req) => `categories`), category_controller_1.allCategory);
exports.default = router;
