import Repository from "./repository";
import Cart, { ICart } from "../models/Cart";

class CartRepository extends Repository<ICart> {}

export default new CartRepository(Cart);
