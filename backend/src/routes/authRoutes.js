import { Router } from "express";
import {rateLimit} from "express-rate-limit"
import {
  register,
  login,
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";

import {
  registerSchema,
  loginSchema
} from "../validators/authSchemas.js";
import { success } from "zod";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15*60*1000,
  limit : 5,
  standardHeaders: false,
  message:{
    success: false,
    message: "Too many login attempts. Please try Again later."
  }
})


// register the user
router.post(
  "/register",
  validate(registerSchema),
  register
);

// login user 
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  login
);

export default router;