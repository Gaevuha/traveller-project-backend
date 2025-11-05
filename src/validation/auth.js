import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Email must be a valid email',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password should have at least {#limit} characters',
    'any.required': 'Password is required',
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email',
  }),
  password: Joi.string().required().messages({
    'string.min': 'Password should have at least {#limit} characters',
    'any.required': 'Password is required',
  }),
});

export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
    password: Joi.string().required().messages({
    'string.min': 'Password should have at least {#limit} characters',
    'any.required': 'Password is required',
  }),
});

export const loginWithGoogleOAuthSchema = Joi.object({
  code: Joi.string().required(),
});
