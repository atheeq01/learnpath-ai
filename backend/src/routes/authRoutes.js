import { Router } from "express";
import {rateLimit} from "express-rate-limit"
import {
  register,
  login,
  getMe
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";


import { authorize } from "../middleware/authorize.js";
import { authenticate } from "../middleware/authenticate.js";

import {
  registerSchema,
  loginSchema
} from "../validators/authSchemas.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15*60*1000,
  limit : 5,
  skipSuccessfulRequests: true,
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

// get the current user 
router.get(
  "/me",
  authenticate,
  getMe
);

// temp 
if (process.env.NODE_ENV === "development") {

  // std only
  router.get(
    "/_test/student-only",
    authenticate,
    authorize("student"),
    (req, res) => {
      return res.status(200).json({
        success: true,
        message: "Student access granted",
      });
    }
  );

  // Instructor only 
  router.get(
    "/_test/instructor-only",
    authenticate,
    authorize("instructor"),
    (req, res) => {
      return res.status(200).json({
        success: true,
        message: "Instructor access granted",
      });
    }
  );

}
export default router;
