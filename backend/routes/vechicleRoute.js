import express from 'express';
import { addCar, getCar } from '../controllers/vechicle.js';

const router = express.Router();

router.post('/addCar', addCar);
router.get('/getCar', getCar);

export default router;