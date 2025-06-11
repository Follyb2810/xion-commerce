import { FilterQuery } from "mongoose";
import Product from "./product.model";
import { IProduct } from "./../../common/types/IProduct";
import Repository from "./../../common/contract/repository";

class ProductRepository extends Repository<IProduct>{
    async countDocuments(query?: FilterQuery<IProduct>): Promise<number> {
        return await Product.countDocuments(query || {});
    }
}

export default new ProductRepository(Product);