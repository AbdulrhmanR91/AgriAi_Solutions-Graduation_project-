/* eslint-env node */
import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', upload.single('idFile'), registerUser);
router.post('/login', loginUser);
router.get('/profile', auth, (req, res) => {
    res.send(req.user);
});

export default router; 