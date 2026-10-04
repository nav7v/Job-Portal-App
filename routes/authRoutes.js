import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { redirectIfLoggedIn } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('auth/login', {
        error: null,
        user: null
    });
});

router.post('/login', login);

router.get('/register', redirectIfLoggedIn, (req, res) => {
    res.render('auth/register', {
        error: null,
        user: null
    });
});

router.post('/register', register);

router.post('/logout', logout);

export default router;
