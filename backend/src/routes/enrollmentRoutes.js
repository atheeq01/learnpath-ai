import { Router } from "express";

import {
  enrollCourse,
  getMyEnrollments,
} from "../controllers/enrollmentController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  createEnrollmentSchema,
} from "../validators/enrollmentSchemas.js";

const router = Router();

// create the enrollment (role : student)
router.post(
  "/",
  authenticate,
  authorize("student"),
  validate(createEnrollmentSchema),
  enrollCourse
);

// get enrolled course list (role: student)
router.get(
  "/me",
  authenticate,
  authorize("student"),
  getMyEnrollments
);

export default router;