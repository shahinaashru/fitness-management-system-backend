const Joi = require("joi");
const registerValidator = Joi.object({
  username: Joi.string().min(2).max(50).required().messages({
    "string.empty": "User Name is required",
    "string.min": "User Name must be at least 2 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email",
  }),

  // phone_number: Joi.string()
  //   .pattern(/^[0-9]{10,15}$/)
  //   .required()
  //   .messages({
  //     "string.empty": "Phone number is required",
  //     "string.pattern.base": "Phone number must be 10-15 digits",
  //   }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one number, and one special character",
    }),
  role: Joi.string()
    .valid("admin", "user", "trainer")
    .default("user")
    .messages({
      "any.only": "Role must be either 'admin', 'user', or 'trainer'",
    }),
});

const loginValidator = Joi.object({
  email: Joi.string().required().messages({
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});
function registerValidation(req, res, next) {
  const { error } = registerValidator.validate(req.body, { convert: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.details[0].message,
    });
  }

  next();
}
function loginValidation(req, res, next) {
  const { error } = loginValidator.validate(req.body, { convert: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.details[0].message,
    });
  }

  next();
}

module.exports = {
  registerValidation,
  loginValidation,
};
