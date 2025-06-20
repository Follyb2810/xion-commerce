import { Router } from "express";
import * as controller from "./deploy.controller";
import { auth } from "../../middleware/auth";
import { verifyRole } from "../../middleware/verifyRole";
import { Roles } from "../../common/types/IUser";

const router = Router();

router.get("/", controller.first);
router.post("/", auth, controller.deployEscrowContract);
router.patch(
  "/:orderId/status",
  auth,
  verifyRole(Roles.ADMIN),
  controller.releaseOrRefund
);

export default router;
