import { Router } from 'express';
import {
  loginUserController,
  registerUserController,
  logoutUserController,
  refreshUserSessionController,
  sendResetEmailController,
  resetPasswordController,
  getGoogleOAuthUrlController,
  loginWithGoogleOAuthController,
} from '../controllers/auth.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
  loginWithGoogleOAuthSchema,
} from '../validation/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginWithGoogleOAuth } from '../services/auth.js';

const authRouter = Router();

// Публічні
authRouter.post(
  '/register',
  validateBody(registerUserSchema),
  registerUserController,
);
authRouter.post('/login', validateBody(loginUserSchema), loginUserController);
authRouter.post('/refresh', refreshUserSessionController);
authRouter.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  sendResetEmailController,
);
authRouter.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);
authRouter.get('/google/get-oauth-url', getGoogleOAuthUrlController);
authRouter.post(
  '/google/confirm-oauth',
  validateBody(loginWithGoogleOAuthSchema),
  loginWithGoogleOAuthController,
);

// новый публичный маршрут для обработки редиректа от Google OAuth
authRouter.get('/google', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code)
      return res.status(400).json({ message: 'Missing authorization code' });

    const { session } = await loginWithGoogleOAuth(code);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    };

    res.cookie('refreshToken', session.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('sessionId', session._id.toString(), {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', session.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    const frontendRedirect = isProd
      ? 'https://project-traveller-app.netlify.app/auth/google-callback'
      : 'http://localhost:3000/auth/google-callback';

    return res.redirect(frontendRedirect);
  } catch (err) {
    next(err);
  }
});
// Приватні
authRouter.post('/logout', authenticate, logoutUserController);

export default authRouter;
