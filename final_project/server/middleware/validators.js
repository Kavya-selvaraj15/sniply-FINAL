const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .toLowerCase(), // just lowercase, no normalizeEmail()

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  validate,
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .toLowerCase(),

  body("password").notEmpty().withMessage("Password is required"),

  validate,
];

const shortenValidation = [
  body("originalUrl")
    .trim()
    .notEmpty().withMessage("URL is required")
    .isURL({ require_protocol: true }).withMessage("Must be a valid URL (include http:// or https://)"),

  body("customAlias")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage("Custom alias must be 3-50 characters")
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage("Custom alias can only contain letters, numbers, hyphens, underscores"),

  body("expiresAt")
    .optional()
    .isISO8601().withMessage("Expiry date must be a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) throw new Error("Expiry date must be in the future");
      return true;
    }),

  validate,
];

module.exports = { registerValidation, loginValidation, shortenValidation };
