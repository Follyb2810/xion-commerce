import mongoose, { Types } from "mongoose";
import { IUser } from "./IUser";

export interface IProduct extends mongoose.Document {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category?: Types.ObjectId;
  seller: Types.ObjectId | IUser;
  stock: number;
  address: string;
  mapping_location?: IMapingLocation;
  image_of_land: string[];
  coverImage: string;
  beds: number;
  baths: number;
  size_of_land: string;
  document_of_land: string[];
  isSpecialOffer?: boolean;
  isBestDeal?: boolean;
  specialOfferPrice?: number;
  percentage?: number;
  isTopSelling?: boolean;
  offerStartDate?: Date;
  offerEndDate?: Date;
  tags?: string[];
  totalSold?: number;
  likes: Types.ObjectId[];
  likeCount: number;
  likedBy: (Types.ObjectId | string)[];
  createdAt: Date;
  isActive: boolean;
}

export type IMapingLocation = { lat: number; lng: number };
