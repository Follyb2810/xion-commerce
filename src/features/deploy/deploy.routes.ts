import { Router } from 'express';
import * as controller from './deploy.controller';

const router = Router();

router.get('/', controller.first);
router.post('/escrow',controller.deployEscrowContract)

export default router;
