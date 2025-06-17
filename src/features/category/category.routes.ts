import { Router } from "express";
import { allCategory } from "./category.controller";
import checkCache from "../../middleware/checkCache";

const router = Router();

router.route("/").get(
  checkCache((req) => `categories`),
  allCategory
);
export default router;
