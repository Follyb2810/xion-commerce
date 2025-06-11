import { Router } from 'express';
import * as controller from './xion.controller';

const router = Router();

router.get('/', controller.getAddressBalance);

export default router;
