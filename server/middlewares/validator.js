// server/middlewares/validator.js
import Joi from 'joi';
import { ValidationError } from '../lib/errors/AppError.js';

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
};

export const validate = (schema) => (req, _res, next) => {
  const { value, error } = schema.validate(req.body, validationOptions);

  if (error) {
    const errors = error.details.map(err => ({
      field: err.path.join('.'),
      message: err.message.replace(/"/g, '')
    }));
    throw new ValidationError(errors);
  }

  // Update request with sanitized values
  req.body = value;
  next();
};

export const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().min(1).required()
      })
    )
    .min(1)
    .required(),
  total: Joi.number().min(0.01).required()
});