import mongoose from "mongoose";
import { Category } from "./../features/category/category.model";
import { categoriesSeed } from "../seed/categorySeed";
import User from "./../features/user/user.model";
import Product from "./../features/product/product.model";
import Order from "./../features/cart/cart.model";
import Cart from "./../features/cart/cart.model";
import { hashPwd } from "./../common/libs/bcrypt";
import { Roles } from "./../common/types/IUser";

export const connectDb = async (): Promise<any> => {
  try {
    mongoose.set("strictQuery", true);
    const db = await mongoose.connect(process.env.MONGO_URI as string);
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

//      await User.collection.dropIndex("walletAddress_1")
//      console.log('success')

    const existingCategories = await Category.find();
    if (existingCategories.length === 0) {
      await Category.insertMany(categoriesSeed);
      console.log("Categories seeded successfully.");
    }
    
    const email = "superadmin@chaincart.com";
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const hashedPassword = await hashPwd("Chaincart123");

      const superAdmin = new User({
        username: "superadmin123",
        email,
        password: hashedPassword,
        isVerified: true,
        isEmailVerified: true,
        isAuthenticated: true,
        walletAddress:"xion15rdntqgppzvgvcngs3e592wt6fhwfmctqxppv2qrhv7s47zxy9ksfe5g9r",
        role: [Roles.ADMIN, Roles.SUPERADMIN, Roles.BUYER, Roles.SELLER],
        profile: {
          name: "Super Admin",
          bio: "System administrator with all permissions",
        },
      });

      await superAdmin.save();
      console.log("Super admin user created successfully.");
    } else {
      console.log("Super admin already exists.");
    }

    // const users = await User.collection.find().toArray();
    // console.log("Current Users:", users);

    // const indexes = await User.collection.getIndexes();
    // console.log("User Indexes:", indexes);

    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
