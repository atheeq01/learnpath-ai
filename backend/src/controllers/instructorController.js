import mongoose from "mongoose";

import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// get teh all course own by the instructor 
export const getInstructorCourses = async (req, res) => {
  const filter = {
    instructorId: req.user.id,
  };

  if (req.query.includeArchived !== "true") {
    filter.isDeleted = { $ne: true };
  }

  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    count: courses.length,
    courses,
  });
};


// get the all students enrolled in instructor course.
export const getCourseStudents = async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  if (course.instructorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You do not own this course",
    });
  }

  const filter = { courseId: id };

  if (req.query.status !== "all") {
    filter.status = "enrolled";
  }

  const enrollments = await Enrollment.find(filter)
    .populate(
      "studentId",
      "name username email"
    )
    .sort({ enrolledAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    count: enrollments.length,
    students: enrollments,
  });
};


// unenroll the student from the course without delete
export const unenrollStudent = async (req, res) => {
  const { id, studentId } = req.params;

  if (!mongoose.isObjectIdOrHexString(studentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  const course = await Course.findById(id);

  if (!course || course.isDeleted) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  if (course.instructorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You do not own this course",
    });
  }

  const now = new Date();

  // Update only an active enrollment
  const enrollment = await Enrollment.findOneAndUpdate(
    {
      courseId: id,
      studentId,
      status: "enrolled",
    },
    {
      $set: {
        status: "unenrolled",
        unenrolledAt: now,
      },
      $push: {
        history: {
          action: "unenrolled",
          at: now,
          actorId: req.user.id,
          reason: "instructor_removed",
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!enrollment) {
    const existing = await Enrollment.exists({
      courseId: id,
      studentId,
    });

    return res.status(existing ? 409 : 404).json({
      success: false,
      message: existing
        ? "Student already unenrolled"
        : "Enrollment not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Student unenrolled successfully",
    enrollment,
  });
};