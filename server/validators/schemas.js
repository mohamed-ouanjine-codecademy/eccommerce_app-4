// server/validators/schemas.js
import Joi from 'joi';

export default {
  product: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0.01).required(),
    category: Joi.string().valid(
      'electronics', 
      'clothing', 
      'home', 
      'other'
    ).required(),
    stock: Joi.number().integer().min(0)
  }),

  order: Joi.object({
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().length(2).required(),
      zipCode: Joi.string().pattern(/^\d{5}$/).required()
    }).required(),
    paymentMethod: Joi.string().required()
  }),

  userRegistration: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})')
    ).required()
  })
};