import { Router } from "express";

import {
    createCourse, 
    getCourse,
    getCourseById,
    updateCourse,
    deleteCourse
} from "../controllers/courseController.js"

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { validateCourseId } from "../middleware/validateCourseId.js";

import {
    createCourseSchema,
    updateCourseSchema
} from "../validators/courseSchemas.js";

const router = Router();

// create course ( role : instructors )
router.post(
    "/",
    authenticate,
    authorize("instructor"),
    validate(createCourseSchema),
    createCourse
)

// list the all course (public)
router.get("/",getCourse)

// get user using id (public)
router.get(
  "/:id",
  validateCourseId,
  getCourseById
);

// update the user by id and own instructor 
router.patch(
  "/:id",
  authenticate,
  authorize("instructor"),
  validateCourseId,
  validate(updateCourseSchema),
  updateCourse
);

// delete the user by id and own instructor 
router.delete(
  "/:id",
  authenticate,
  authorize("instructor"),
  validateCourseId,
  deleteCourse
);

export default router