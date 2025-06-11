"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    specialOfferPrice: { type: Number },
    percentage: { type: Number },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category" },
    seller: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    stock: { type: Number, default: 0 },
    beds: { type: Number, default: 1 },
    baths: { type: Number, default: 1 },
    address: { type: String, required: true },
    mapping_location: {
        lat: Number,
        lng: Number,
    },
    image_of_land: {
        type: [String],
        validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
        default: [],
    },
    coverImage: { type: String, required: true },
    size_of_land: { type: String, required: true },
    // document_of_land: { type: String, required: true },
    document_of_land: {
        type: [String],
        validate: [docLimit, "{PATH} exceeds the limit of 6"],
        default: [],
    },
    isSpecialOffer: { type: Boolean, default: false },
    isBestDeal: { type: Boolean, default: false },
    isTopSelling: { type: Boolean, default: false },
    offerStartDate: { type: Date },
    offerEndDate: { type: Date },
    tags: [{ type: String }],
    totalSold: { type: Number, default: 0 },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },
    likedBy: [{ type: mongoose_1.Schema.Types.Mixed }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
function arrayLimit(val) {
    return val.length <= 4;
}
function docLimit(val) {
    return val.length <= 6;
}
productSchema.pre("save", function (next) {
    const price = this.price;
    const specialPrice = this.specialOfferPrice;
    if (this.isSpecialOffer &&
        typeof specialPrice === "number" &&
        typeof price === "number") {
        const discount = ((price - specialPrice) / price) * 100;
        this.percentage = Math.round(discount);
    }
    else {
        this.percentage = 0;
    }
    next();
});
productSchema.pre("findOneAndUpdate", function (next) {
    var _a, _b, _c;
    const update = this.getUpdate();
    const price = (_a = update.price) !== null && _a !== void 0 ? _a : this.get("price");
    const specialOfferPrice = (_b = update.specialOfferPrice) !== null && _b !== void 0 ? _b : this.get("specialOfferPrice");
    const isSpecialOffer = (_c = update.isSpecialOffer) !== null && _c !== void 0 ? _c : this.get("isSpecialOffer");
    if (isSpecialOffer &&
        typeof specialOfferPrice === "number" &&
        typeof price === "number") {
        const discount = ((price - specialOfferPrice) / price) * 100;
        update.percentage = Math.round(discount);
    }
    else {
        update.percentage = 0;
    }
    this.setUpdate(update);
    next();
});
productSchema.index({ category: 1 });
productSchema.index({ isSpecialOffer: 1 });
productSchema.index({ isBestDeal: 1 });
productSchema.index({ isTopSelling: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, isActive: 1, stock: 1 });
exports.default = mongoose_1.default.models.Product ||
    mongoose_1.default.model("Product", productSchema);
