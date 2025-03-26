import { Category, ICategory } from "../models/Category";
import Repository from "./repository";


class CategoryRepository extends Repository<ICategory>{}

export default new CategoryRepository(Category)