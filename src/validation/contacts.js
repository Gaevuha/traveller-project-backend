import Joi from 'joi';


export const createContactSchema = Joi.object({
    name: Joi.string().trim().min(3).max(20).required().messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
    'any.required': 'Username is required',
  }),

   phoneNumber: Joi.string()
    .trim()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.base': 'phoneNumber should be a string',
      'string.min': 'phoneNumber should have at least {#limit} characters',
      'string.max': 'phoneNumber should have at most {#limit} characters',
      'any.required': 'phoneNumber is required',
      'string.pattern.base': 'phoneNumber has invalid format',
    }),

    email: Joi.string()
    .trim()
    .email()
    .allow(null)
    .optional()
    .messages({
      'string.email': 'Email must be a valid email',
    }),

  isFavourite: Joi.boolean(),

  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .messages({
      'any.only': 'contactType must be one of: work, home, personal',
      'any.required': 'contactType is required',
    })
})



export const updateContactSchema = Joi.object({
    name: Joi.string().trim().min(3).max(20).messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters'
  }),

   phoneNumber: Joi.string()
    .trim()
    .min(3)
    .max(20)
    .messages({
      'string.base': 'phoneNumber should be a string',
      'string.min': 'phoneNumber should have at least {#limit} characters',
      'string.max': 'phoneNumber should have at most {#limit} characters',
      'string.pattern.base': 'phoneNumber has invalid format',
    }),

    email: Joi.string()
    .trim()
    .email()
    .allow(null)
    .optional()
    .messages({
      'string.email': 'Email must be a valid email',
    }),

  isFavourite: Joi.boolean(),

  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .messages({
      'any.only': 'contactType must be one of: work, home, personal',
      'any.required': 'contactType is required',
    })
})