import { Application, Router } from "express";
import adminRoute from "./admin/admin.routes";
import userRoute from "./user/user.routes";
import cartRoute from "./cart/cart.routes";
import categoryRoute from "./category/category.routes";
import chatRoute from "./chat/chat.routes";
import productRoute from "./product/product.routes";
import xionRoute from "./xion/xion.routes";
import walletRoute from "./user/wallet.routes";
import orderRoute from "./order/order.routes";
import deployRoute from "./deploy/deploy.routes";

export const routeList: { path: string; router: Router }[] = [
  { path: "/", router: userRoute },
  { path: "/", router: walletRoute },
  { path: "/product", router: productRoute },
  { path: "/cart", router: cartRoute },
  { path: "/order", router: orderRoute },
  { path: "/category", router: categoryRoute },
  { path: "/xion", router: xionRoute },
  { path: "/admin", router: adminRoute },
  { path: "/chat", router: chatRoute },
  { path: "/deploy", router: deployRoute },
];

export default function loadRoutes(app: Application) {
  routeList.forEach(({ path, router }) => {
    app.use(`/api${path}`, router);
  });
}

// export default (app: Application) => {
//   app.use("/api", userRoute);
//   app.use("/api", walletRoute);
//   app.use("/api/product", productRoute);
//   app.use("/api/cart", cartRoute);
//   app.use("/api/order", orderRoute);
//   app.use("/api/category", categoryRoute);
//   app.use("/api/xion", xionRoute);
//   app.use("/api/admin", adminRoute);
//   app.use("/api/chat", chatRoute);
//   app.use("/api/deploy", deployRoute);
// };

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


// src/app.routes.ts
// import { Application, Router } from "express";
// import fs from "fs";
// import path from "path";

// export default function loadRoutes(app: Application) {
//   const routesPath = path.join(__dirname, "routes");

//   fs.readdirSync(routesPath).forEach((file) => {
//     if (file.endsWith(".routes.ts") || file.endsWith(".routes.js")) {
//       const route = require(path.join(routesPath, file));
//       const routeModule: Router = route.default;

//       // Remove `.routes.ts` and add as path: e.g. `user.routes.ts` -> `/user`
//       const routeName = "/" + file.replace(".routes.ts", "").replace(".routes.js", "").replace(".routes", "");

//       app.use(`/api${routeName}`, routeModule);
//     }
//   });
// }

