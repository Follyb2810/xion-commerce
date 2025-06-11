import { Router } from 'express';
import * as controller from './admin.controller';

const router = Router();

router.get('/', controller.first);

export default router;
