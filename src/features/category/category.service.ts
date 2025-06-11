import CategoryRepository from "./category.repository";
class CategoryService {
  async allCategory() {
    return CategoryRepository.getAll();
  }
}

export default new CategoryService();