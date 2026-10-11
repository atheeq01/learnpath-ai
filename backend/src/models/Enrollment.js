import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  status: {
    type: String,
    enum: ["enrolled", "unenrolled"],
    default: "enrolled",
  },

  enrolledAt: {
    type: Date,
    default: Date.now,
  },

  unenrolledAt: {
    type: Date,
    default: null,
  },

  history: [
    {
      action: {
        type: String,
        enum: ["enrolled", "unenrolled"],
        required: true,
      },

      at: {
        type: Date,
        required: true,
      },

      actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      reason: {
        type: String,
        enum: [
          "student_enrollment",
          "instructor_removed",
          "course_archived",
        ],
        required: true,
      },
    },
  ],
});

enrollmentSchema.index(
  { studentId: 1, courseId: 1 },
  { unique: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);