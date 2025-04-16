import express from 'express';
import authController from '../controllers/auth.controller';
import { validateLogin, validateRegister, validateUpdateProfile } from '../validators/auth.validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validateUpdateProfile, authController.updateProfile);

export default router; 