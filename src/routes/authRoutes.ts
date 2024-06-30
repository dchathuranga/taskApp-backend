import express from 'express';
import { login, refreshToken, registerUser } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.post('/register', registerUser);
router.post('/refreshToken', refreshToken);

export default router;
