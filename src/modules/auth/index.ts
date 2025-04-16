import authRoutes from './routes/auth.routes';
import authController from './controllers/auth.controller';
import authService from './services/auth.service';
import { authenticate } from './middlewares/auth.middleware';
import { validateLogin, validateRegister, validateUpdateProfile } from './validators/auth.validator';

export {
  authRoutes,
  authController,
  authService,
  authenticate,
  validateLogin,
  validateRegister,
  validateUpdateProfile
}; 