import mongoose ,{ Types }  from "mongoose";
import { IUser } from "./IUser";

export interface IProduct extends mongoose.Document {
    _id: string;
    title: string;
    description?: string;
    price: number;
    category?:Types.ObjectId;
    seller:Types.ObjectId | IUser;
    stock: number;
    address:string;
    mapping_location:IMapingLocation;
    image_of_land:string;
    size_of_land:string;
    document_of_land:string;
  }

export type IMapingLocation = { lat:number, lng: number }

