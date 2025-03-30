import {Router} from 'express'
import { getAddressBalance, sendXionToEscrowContract } from '../controllers/xionController'
import { auth } from '../middleware/auth'

const router = Router()

// ?address=address
router.get('/balance',getAddressBalance)
router.post('/send_to_escrow',auth,sendXionToEscrowContract)
export default router