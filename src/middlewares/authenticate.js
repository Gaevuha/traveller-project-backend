import createHttpError from 'http-errors';
import { findSession, findUser } from '../services/auth.js';

export const authenticate = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.cookies?.refreshToken ||
      req.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return next(createHttpError(401, 'Authorization token is missing'));
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

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return next(createHttpError(500, 'Authentication failed'));
  }
};
