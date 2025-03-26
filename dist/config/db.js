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
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Category_1 = require("../models/Category");
const categorySeed_1 = require("../seed/categorySeed");
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        mongoose_1.default.set("strictQuery", true);
        const db = yield mongoose_1.default.connect(process.env.MONGO_URI);
        // try {
        //   await mongoose?.connection?.db?.dropCollection("users");
        //   console.log("Dropped users collection.");
        // } catch (err: any) {
        //   if (err.code === 26) {
        //     console.log("Users collection not found or already dropped.");
        //   } else {
        //     console.error("Error dropping users collection:", err.message);
        //   }
        // }
        // try {
        //   await mongoose?.connection?.db?.collection("users").dropIndex("email_1");
        //   console.log("Dropped index email_1");
        // } catch (err: any) {
        //   if (err.code === 27) {
        //     console.log("Index email_1 not found or already dropped.");
        //   } else {
        //     console.error("Error dropping index:", err.message);
        //   }
        // }
        // if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
        //   console.log(`Purging database as NODE_ENV is ${process.env.NODE_ENV}`);
        //   await User.deleteMany({});
        //   console.log("All users deleted.");
        //   await Category.deleteMany();
        //   console.log("Existing categories deleted.");
        //   await Product.deleteMany();
        //   console.log("Existing Product deleted");
        //   await Order.deleteMany();
        //   console.log("Existing Order deleted");
        //   await Cart.deleteMany();
        //   console.log("Existing Cart deleted");
        // }
        const category = yield Category_1.Category.find();
        if (category.length == 0) {
            // Insert new categories
            yield Category_1.Category.insertMany(categorySeed_1.categoriesSeed);
            console.log("Categories seeded successfully.");
        }
        console.log("db is connected");
        return db;
    }
    catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
});
exports.connectDb = connectDb;
