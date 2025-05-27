"use strict";
// cron.schedule("0 0 * * *", async () => {
//   console.log("⏰ Running daily job to deactivate expired offers");
//   const now = new Date();
//   await ProductModel.updateMany(
//     {
//       isSpecialOffer: true,
//       offerEndDate: { $lt: now }
//     },
//     {
//       $set: {
//         isSpecialOffer: false,
//         specialOfferPrice: null,
//         offerStartDate: null,
//         offerEndDate: null
//       }
//     }
//   );
//   console.log("✅ Expired offers deactivated");
// });
// cron.schedule("0 1 * * *", async () => {
//   console.log("🏆 Updating Best Sellers");
//   const topProducts = await ProductModel.find({})
//     .sort({ totalSold: -1 }) // or salesThisWeek if you're tracking
//     .limit(10); // or more
//   // Update each one
//   await ProductModel.updateMany({}, { $set: { isBestSeller: false } });
//   const ids = topProducts.map(p => p._id);
//   await ProductModel.updateMany(
//     { _id: { $in: ids } },
//     { $set: { isBestSeller: true } }
//   );
//   console.log("✅ Best sellers updated");
// });
//? trending
// viewsToday: number;
// viewsLast7Days: number;
// salesToday: number;
// await ProductModel.findByIdAndUpdate(productId, {
//   $inc: { viewsToday: 1 }
// });
// cron.schedule("0 2 * * *", async () => {
//   const trending = await ProductModel.find({})
//     .sort({ viewsToday: -1 })
//     .limit(10);
//   await ProductModel.updateMany({}, { $set: { isTrending: false } });
//   const ids = trending.map(p => p._id);
//   await ProductModel.updateMany(
//     { _id: { $in: ids } },
//     { $set: { isTrending: true } }
//   );
//   // Optional: Reset viewsToday for next day
//   await ProductModel.updateMany({}, { $set: { viewsToday: 0 } });
// });
