import { FilterQuery } from "mongoose";
import Product from "../models/Product";
import { IProduct } from "../types/IProduct";
import Repository from "./repository";

class ProductRepository extends Repository<IProduct>{
    async countDocuments(query?: FilterQuery<IProduct>): Promise<number> {
        return await Product.countDocuments(query || {});
    }
}

export default new ProductRepository(Product);