import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 1500,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 10000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 60,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({
  instructorId: 1,
  createdAt: -1,
});

const Course = mongoose.model("Course", courseSchema);

export default Course;