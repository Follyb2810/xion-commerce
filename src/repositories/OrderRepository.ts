import Order from "../models/Order";
import { IOrder } from "../types/IOrder";
import Repository from "./repository";

class OrderRepository extends Repository<IOrder>{}

export default new OrderRepository(Order);