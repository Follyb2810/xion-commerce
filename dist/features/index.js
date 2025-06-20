"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeList = void 0;
exports.default = loadRoutes;
const admin_routes_1 = __importDefault(require("./admin/admin.routes"));
const user_routes_1 = __importDefault(require("./user/user.routes"));
const cart_routes_1 = __importDefault(require("./cart/cart.routes"));
const category_routes_1 = __importDefault(require("./category/category.routes"));
const chat_routes_1 = __importDefault(require("./chat/chat.routes"));
const product_routes_1 = __importDefault(require("./product/product.routes"));
const xion_routes_1 = __importDefault(require("./xion/xion.routes"));
const wallet_routes_1 = __importDefault(require("./user/wallet.routes"));
const order_routes_1 = __importDefault(require("./order/order.routes"));
const deploy_routes_1 = __importDefault(require("./deploy/deploy.routes"));
exports.routeList = [
    { path: "/", router: user_routes_1.default },
    { path: "/", router: wallet_routes_1.default },
    { path: "/product", router: product_routes_1.default },
    { path: "/cart", router: cart_routes_1.default },
    { path: "/order", router: order_routes_1.default },
    { path: "/category", router: category_routes_1.default },
    { path: "/xion", router: xion_routes_1.default },
    { path: "/admin", router: admin_routes_1.default },
    { path: "/chat", router: chat_routes_1.default },
    { path: "/deploy", router: deploy_routes_1.default },
];
function loadRoutes(app) {
    exports.routeList.forEach(({ path, router }) => {
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
