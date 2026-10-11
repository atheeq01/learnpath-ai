import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import { recommendationSchema } from "../validators/aiSchemas.js";

import {
  getRecommendations,
} from "../controllers/aiController.js";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
  },
});

router.post(
  "/recommendations",
  authenticate,
  authorize("student"),
  aiLimiter,
  validate(recommendationSchema),
  getRecommendations
);

export default router;