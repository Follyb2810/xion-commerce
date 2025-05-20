import mongoose from "mongoose";
import { Category } from "../models/Category";
import { categoriesSeed } from "../seed/categorySeed";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import Cart from "../models/Cart";

const a = process.env.MONGO_URI
console.log({a})
export const connectDb = async (): Promise<any> => {
  try {
    mongoose.set("strictQuery", true);
    const db = await mongoose.connect(process.env.MONGO_URI as string);
    // const b = await User.collection.dropIndex('mnemonic_1');
    // if(b){
    //   console.log('success frop mnemonic_1 ')
    // }
    // const indexes = await User.collection.getIndexes();
    // console.log(indexes);
    console.log('users')
    // const users = await User.collection.find().toArray(); 
    // console.log(users);
    


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

    const category = await Category.find();
    if (category.length == 0) {
      // Insert new categories
      await Category.insertMany(categoriesSeed);
      console.log("Categories seeded successfully.");
    }

    console.log("db is connected");
    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
