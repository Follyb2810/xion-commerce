import Repository from "./../../common/contract/repository";
import  { ICart } from "./../../common/types/ICart";
import Cart from "./cart.model";
class CartRepository extends Repository<ICart> {}

export default new CartRepository(Cart);
