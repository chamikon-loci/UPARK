import express from 'express';
import { getWallet, createQR, confirmTopup } from '../controllers/wallet.js';

const router = express.Router();

router.get('/getWallet', getWallet);
router.post('/topup', createQR);
router.post('/confirm', confirmTopup);

export default router