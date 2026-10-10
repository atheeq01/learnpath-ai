import { Router } from "express";

import {createCourse,

} from "../controllers/courseController.js"

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
    createCourseSchema,
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

export default router