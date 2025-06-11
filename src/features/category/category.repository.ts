import Repository from "../../common/contract/repository";
import { ICategory } from "../../common/types/ICategory";
import { Category } from "./category.model";


class CategoryRepository extends Repository<ICategory>{}

export default new CategoryRepository(Category)