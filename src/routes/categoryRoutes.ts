import { Router } from "express";
import { allCategory } from "../controllers/categoryController";

const router = Router()

router.route('/').get(allCategory)
export default router;