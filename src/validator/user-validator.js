import Joi from "joi";

const userRegistrationValidation = Joi.object({
  username: Joi.string().min(3).max(36).required(),
  nama: Joi.string().min(3).max(255).required(),
  email: Joi.string().min(3).max(255).email().required(),
  password: Joi.string().min(6).max(255).required(),
});

const userUpdateValidation = Joi.object({
  username: Joi.string().min(3).max(36).required(),
  nama: Joi.string().min(3).max(255).optional(),
  new_password: Joi.string().min(6).max(255).optional(),
  role: Joi.string().optional().valid("Admin", "User").messages({
    "any.only": "Role tidak valid",
  }),
  is_active: Joi.boolean().optional(),
  current_password: Joi.string().min(6).max(255).required(),
});

const userLoginRegistration = Joi.object({
  username: Joi.string().min(3).max(36).required(),
  password: Joi.string().min(6).max(255).required(),
});

const usernameValidation = Joi.string().min(3).max(36).required();

const searchUserValidation = Joi.object({
  username: Joi.string().optional().max(100).messages({
    "string.max": "Panjang username maksimal 100 karakter",
  }),
  nama: Joi.string().optional().max(100).messages({
    "string.max": "Panjang nama maksimal 100 karakter",
  }),
  email: Joi.string().optional().email().messages({
    "string.email": "Format email tidak valid",
  }),
  role: Joi.string().optional().valid("Admin", "User").messages({
    "any.only": "Role tidak valid",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Halaman harus berupa angka",
    "number.min": "Halaman minimal 1",
  }),
  size: Joi.number().integer().min(1).default(10).messages({
    "number.base": "Ukuran halaman harus berupa angka",
    "number.min": "Ukuran halaman minimal 1",
  }),
});

export {
  userRegistrationValidation,
  userLoginRegistration,
  searchUserValidation,
  userUpdateValidation,
  usernameValidation,
};
