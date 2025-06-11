import { Router } from 'express';
import * as controller from './super.controller';

const router = Router();

router.get('/', controller.first);

export default router;
