import { Router } from "express";
import { allCategory } from "./category.controller";

const router = Router()

router.route('/').get(allCategory)
export default router;