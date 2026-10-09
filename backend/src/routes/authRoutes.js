import { Router } from "express";

import { register } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerSchema } from "../validators/authSchemas.js";

const router = Router();

// register the user
router.post(
  "/register",
  validate(registerSchema),
  register
);

export default router;