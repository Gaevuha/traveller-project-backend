import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';
import { getEnvVar } from './getEnvVar.js';

const redirectUri = getEnvVar('GOOGLE_OAUTH_REDIRECT');
const clientId = getEnvVar('GOOGLE_OAUTH_CLIENT_ID');
const clientSecret = getEnvVar('GOOGLE_OAUTH_CLIENT_SECRET');

const googleOAuthClient = new OAuth2Client({
  clientId,
  clientSecret,
  redirectUri,
});

// GET GOOGLE AUTH (PUBLIC)
export const generateOAuthUrl = () => {
  const url = googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
  console.log('🌐 [Google OAuth] Generated URL:', url);

  return url;
};
/**
 * Валідує код із фронтенду (callback), обмінює його на токен
 */
export const validateCode = async (code) => {
  try {
    const { tokens } = await googleOAuthClient.getToken(code);

    if (!tokens.id_token) {
      throw createHttpError(401, 'Google OAuth2: missing id_token');
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    return ticket;
  } catch (error) {
    console.error('❌ Google OAuth validation error:', error.message);
    throw createHttpError(401, 'Google OAuth2 validation failed');
  }
};

/**
 * Отримує повне ім’я користувача з payload токена Google
 */
export const getFullNameFromGoogleTokenPayload = ({
  name,
  given_name,
  family_name,
}) => {
  if (name) return name;
  if (given_name && family_name) return `${given_name} ${family_name}`;
  if (given_name) return given_name;
  return 'Guest';
};
