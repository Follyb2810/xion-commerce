import { Router } from 'express';
import * as controller from './auth.controller';

const router = Router();

router.get('/', controller.first);

export default router;
