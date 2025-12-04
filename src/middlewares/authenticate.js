import { findSession, findUser } from '../services/auth.js';

export const authenticate = async (req, res, next) => {
  try {
    let accessToken;

    // 1. Перевіряємо accessToken в cookies
    if (req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken;
    }

    if (!accessToken) {
      req.user = null;
      return next();
    }

    // 2. Шукаємо сесію
    const session = await findSession({ accessToken });

    if (!session) {
      req.user = null;
      return next();
    }

    // 3. Знаходимо користувача
    const user = await findUser({ _id: session.userId });
    if (!user) {
      req.user = null;
      return next();
    }

    // 4. Додаємо користувача до запиту
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      theme: user.theme,
      avatarUrl: user.avatarUrl,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    req.user = null;
    next();
  }
};
