import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/IProduct";

const productSchema: Schema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    specialOfferPrice: { type: Number },
    percentage: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stock: { type: Number, default: 0 },
    beds: { type: Number, default: 1 },
    baths: { type: Number, default: 1 },
    address: { type: String, required: true },
    mapping_location: {
      lat: Number,
      lng: Number,
    },
    image_of_land: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
      default: [],
    },
    coverImage: { type: String, required: true },
    size_of_land: { type: String, required: true },
    // document_of_land: { type: String, required: true },
    document_of_land: {
  type: [String],
  validate: [docLimit, "{PATH} exceeds the limit of 6"],
  default: [],
},

    isSpecialOffer: { type: Boolean, default: false },
    isBestDeal: { type: Boolean, default: false },
    isTopSelling: { type: Boolean, default: false },
    offerStartDate: { type: Date },
    offerEndDate: { type: Date },
    tags: [{ type: String }],
    totalSold: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.Mixed }],
    isActive: { type: Boolean, default: true },

  },
  { timestamps: true }
);

function arrayLimit(val: string[]) {
  return val.length <= 4;
}
function docLimit(val: string[]) {
  return val.length <= 6;
}


productSchema.pre("save", function (next) {
  const price = this.price as number;
  const specialPrice = this.specialOfferPrice as number;

  if (
    this.isSpecialOffer &&
    typeof specialPrice === "number" &&
    typeof price === "number"
  ) {
    const discount = ((price - specialPrice) / price) * 100;
    this.percentage = Math.round(discount);
  } else {
    this.percentage = 0;
  }
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  const price = update.price ?? this.get("price");
  const specialOfferPrice =
    update.specialOfferPrice ?? this.get("specialOfferPrice");
  const isSpecialOffer = update.isSpecialOffer ?? this.get("isSpecialOffer");

  if (
    isSpecialOffer &&
    typeof specialOfferPrice === "number" &&
    typeof price === "number"
  ) {
    const discount = ((price - specialOfferPrice) / price) * 100;
    update.percentage = Math.round(discount);
  } else {
    update.percentage = 0;
  }

  this.setUpdate(update);
  next();
});


export default mongoose.models.Product ||
mongoose.model<IProduct>("Product", productSchema);

// productSchema.pre("findOneAndUpdate", function (next) {
//   const update = this.getUpdate() as any;

//   if (!update) return next();

//   const data = update.$set || update;

//   const price = data.price;
//   const specialPrice = data.specialOfferPrice;
//   const isSpecialOffer = data.isSpecialOffer;

//   if (
//     isSpecialOffer &&
//     typeof price === "number" &&
//     typeof specialPrice === "number"
//   ) {
//     const discount = ((price - specialPrice) / price) * 100;
//     data.percentage = Math.round(discount);
//   } else {
//     data.percentage = 0;
//   }

//   if (update.$set) {
//     update.$set = data;
//   } else {
//     this.setUpdate(data);
//   }

//   next();
// });