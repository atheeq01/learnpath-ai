import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

// enroll the course and check the course is available or not 
export const enrollCourse = async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;
  const now = new Date();

  let enrollment;
  let created = false;

  try {
    await mongoose.connection.transaction(async (session) => {
      // Lock the active course against concurrent archiving
      const course = await Course.findOneAndUpdate(
        {
          _id: courseId,
          isDeleted: { $ne: true },
        },
        { $inc: { enrollmentRevision: 1 } },
        { session, new: true }
      );

      if (!course) {
        throw Object.assign(new Error("Course not found"), {
          statusCode: 404,
        });
      }

      const existing = await Enrollment.findOne({
        studentId,
        courseId,
      }).session(session);

      if (existing?.status === "enrolled") {
        throw Object.assign(new Error("Already enrolled"), {
          statusCode: 409,
        });
      }

      if (existing) {
        // Re-enroll using the same historical record
        enrollment = await Enrollment.findOneAndUpdate(
          { _id: existing._id, status: "unenrolled" },
          {
            $set: {
              status: "enrolled",
              unenrolledAt: null,
            },
            $push: {
              history: {
                action: "enrolled",
                at: now,
                actorId: studentId,
                reason: "student_enrollment",
              },
            },
          },
          { new: true, session, runValidators: true }
        );

        if (!enrollment) {
          throw Object.assign(new Error("Already enrolled"), {
            statusCode: 409,
          });
        }
      } else {
        [enrollment] = await Enrollment.create(
          [{
            studentId,
            courseId,
            enrolledAt: now,
            history: [{
              action: "enrolled",
              at: now,
              actorId: studentId,
              reason: "student_enrollment",
            }],
          }],
          { session }
        );

        created = true;
      }
    });
  } catch (error) {
    if (error.statusCode || error.code === 11000) {
      return res.status(error.statusCode || 409).json({
        success: false,
        message: error.code === 11000
          ? "Already enrolled"
          : error.message,
      });
    }

    throw error;
  }

  return res.status(created ? 201 : 200).json({
    success: true,
    message: created
      ? "Enrollment successful"
      : "Re-enrollment successful",
    enrollment,
  });
};


// list student enrollment 
export const getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({
    studentId: req.user.id,
  })
    .populate({
      path: "courseId",
      select:
        "title description category level instructorId isDeleted deletedAt",
    })
    .sort({ enrolledAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    count: enrollments.length,
    enrollments,
  });
};
