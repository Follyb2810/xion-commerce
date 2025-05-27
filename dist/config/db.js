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
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = require("../utils/bcrypt");
const IUser_1 = require("../types/IUser");
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        mongoose_1.default.set("strictQuery", true);
        const db = yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        // // delee
        //     if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
        //       console.log(`Purging database as NODE_ENV is ${process.env.NODE_ENV}`);
        //       await Promise.all([
        //         User.deleteMany({}),
        //         Category.deleteMany({}),
        //         Product.deleteMany({}),
        //         Order.deleteMany({}),
        //         Cart.deleteMany({})
        //       ]);
        //       console.log("All collections cleared.");
        //     }
        // // drop db
        //     try {
        //       await mongoose?.connection?.db?.dropCollection("users");
        //       console.log("Dropped users collection.");
        //     } catch (err: any) {
        //       if (err.code === 26) {
        //         console.log("Users collection not found or already dropped.");
        //       } else {
        //         console.error("Error dropping users collection:", err.message);
        //       }
        //     }
        //     try {
        //       await mongoose?.connection?.db?.collection("users").dropIndex("email_1");
        //       console.log("Dropped index email_1.");
        //     } catch (err: any) {
        //       if (err.code === 27) {
        //         console.log("Index email_1 not found or already dropped.");
        //       } else {
        //         console.error("Error dropping index email_1:", err.message);
        //       }
        //     }
        //     try {
        //       const dropMnemonic = await User.collection.dropIndex("mnemonic_1");
        //       if (dropMnemonic) {
        //         console.log("Dropped index mnemonic_1.");
        //       }
        //     } catch (err: any) {
        //       if (err.code === 27) {
        //         console.log("Index mnemonic_1 not found or already dropped.");
        //       } else {
        //         console.error("Error dropping index mnemonic_1:", err.message);
        //       }
        //     }
        // Seed Categories (If Empty)
        const existingCategories = yield Category_1.Category.find();
        if (existingCategories.length === 0) {
            yield Category_1.Category.insertMany(categorySeed_1.categoriesSeed);
            console.log("Categories seeded successfully.");
        }
        //  Seed Super Admin (If Not Exists)
        const email = "superadmin@chaincart.com";
        const existingUser = yield User_1.default.findOne({ email });
        if (!existingUser) {
            const hashedPassword = yield (0, bcrypt_1.hashPwd)("Chaincart123");
            const superAdmin = new User_1.default({
                username: "superadmin",
                email,
                password: hashedPassword,
                isVerified: true,
                isEmailVerified: true,
                isAuthenticated: true,
                role: [IUser_1.Roles.ADMIN, IUser_1.Roles.SUPERADMIN, IUser_1.Roles.BUYER, IUser_1.Roles.SELLER],
                profile: {
                    name: "Super Admin",
                    bio: "System administrator with all permissions",
                },
            });
            yield superAdmin.save();
            console.log("Super admin user created successfully.");
        }
        else {
            console.log("Super admin already exists.");
        }
        // const users = await User.collection.find().toArray();
        // console.log("Current Users:", users);
        // const indexes = await User.collection.getIndexes();
        // console.log("User Indexes:", indexes);
        return db;
    }
    catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
});
exports.connectDb = connectDb;
