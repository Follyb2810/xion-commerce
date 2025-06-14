import { Application } from "express";
import adminRoute from "./admin/admin.routes";
import userRoute from "./user/user.routes";
import cartRoute from "./cart/cart.routes";
import categoryRoute from "./category/category.routes";
import chatRoute from "./chat/chat.routes";
import productRoute from "./product/product.routes";
import xionRoute from "./xion/xion.routes";
import walletRoute from "./user/wallet.routes";
import orderRoute from "./order/order.routes";

export default (app: Application) => {
  app.use("/api", userRoute);
  app.use("/api", walletRoute);
  app.use("/api/product", productRoute);
  app.use("/api/cart", cartRoute);
  app.use("/api/order", orderRoute);
  app.use("/api/category", categoryRoute);
  app.use("/api/xion", xionRoute);
  app.use("/api/admin", adminRoute);
  app.use("/api/chat", chatRoute);
};

// import  fs from "fs";
// import path from "path";
// import { Router } from "express";

// const router = Router();

// const modulesPath = path.join(__dirname);

// fs.readdirSync(modulesPath).forEach((module)=>{
//     if(fs.statSync(path.join(module,module)).isDirectory()){
//         const moduleRoutes = require(path.join(modulesPath,module,`${module}.routes`)).default;
//         router.use(`api/${module}`,moduleRoutes)
//     }
// })

// export default router;
// import modulesRoutes from '.'
// app.use(modulesRoutes)
