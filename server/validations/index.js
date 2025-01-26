// server/validations/index.js
import Joi from 'joi';
import { ValidationError } from '../lib/errors/AppError.js';

const schemas = {
  product: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0.01).required(),
    category: Joi.string().valid('electronics', 'clothing', 'home', 'other'),
    stock: Joi.number().integer().min(0).default(0)
  }),

  order: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().hex().length(24).required(),
          quantity: Joi.number().min(1).required()
        })
      )
      .min(1)
      .required()
  })
};

export const validate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) throw new Error(`Schema ${schemaName} not found`);

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message.replace(/"/g, '')
    }));
    throw new ValidationError('Invalid request data', details);
  }

  req.validatedData = value;
  next();
};