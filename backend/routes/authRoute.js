import express from 'express';
import { register, login, logout, currentUser } from '../controllers/auth.js'
import { protect } from '../middlewares/authMiddle.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, currentUser);

export default router;
