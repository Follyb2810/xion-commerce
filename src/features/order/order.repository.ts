import Order from "./order.model";
import { IOrder } from "./../../common/types/IOrder";
import Repository from "./../../common/contract/repository";

class OrderRepository extends Repository<IOrder>{}

export default new OrderRepository(Order);