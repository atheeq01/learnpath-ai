import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateCourseId } from "../middleware/validateCourseId.js";

import {
  getInstructorCourses,
  getCourseStudents,
  unenrollStudent,
} from "../controllers/instructorController.js";

const router = Router();

// protect all instructor routes (only own course )
router.use(
  authenticate,
  authorize("instructor")
);

// own courses
router.get(
  "/courses",
  getInstructorCourses
);

// students enrolled in own course
router.get(
  "/courses/:id/students",
  validateCourseId,
  getCourseStudents
);

// remove student without deleting history
router.patch(
  "/courses/:id/students/:studentId/unenroll",
  validateCourseId,
  unenrollStudent
);

export default router;