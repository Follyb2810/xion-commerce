import User from "../models/User";
import { IUser } from "../types/IUser";
import Repository from "./repository";

class UserRepository extends Repository<IUser>{}

export default new UserRepository(User)