import express from 'express';

import { getParkingLot, getParkingSlot } from '../controllers/parkingLot.js';

const router = express.Router();

router.get('/search', getParkingLot);
router.get('/slots', getParkingSlot);

export default router;