import createHttpError from 'http-errors';
import { findSession, findUser } from '../services/auth.js';

export const authenticate = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.cookies?.refreshToken ||
      req.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return next(); // Продовжуємо без автентифікації
    }

    const session = await findSession({ accessToken });

    if (!session) {
      return next(createHttpError(401, 'Session not found or invalid token'));
    }

    if (new Date(session.accessTokenValidUntil) < new Date()) {
      return next(createHttpError(401, 'Access token has expired'));
    }

    const user = await findUser({ _id: session.userId });

    if (!user) {
      return next(createHttpError(401, 'User not found'));
    }

    // Додаємо користувача до запиту
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      theme: user.theme,
      avatarUrl: user.avatarUrl,
    };

    return next();
  } catch (error) {
    console.error(error.message);
    return next(createHttpError(500, 'Authentication failed'));
  }
};
