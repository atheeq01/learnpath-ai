import Course from "../models/Course.js";

import {
  recommendCourses,
} from "../services/recommendationService.js";

export const getRecommendations = async (req, res) => {
  const { prompt } = req.body;


  const courses = await Course.find({
    isDeleted: { $ne: true },
  })
    .select("title description category level")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  if (courses.length === 0) {
    return res.status(200).json({
      success: true,
      reply: "No courses are currently available.",
      recommendations: [],
    });
  }

  try {
    const result = await recommendCourses(prompt, courses);

    return res.status(200).json({
      success: true,
      reply: result.reply,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error("AI recommendation failed:", {
      status: error.status,
      message: error.message,
    });

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI request limit reached. Please try again later.",
      });
    }

    if (error.statusCode === 503 || error.status === 401) {
      return res.status(503).json({
        success: false,
        message: "AI service is not configured or available.",
      });
    }

    if (
      error.name === "APIConnectionTimeoutError" ||
      error.name === "APIConnectionError"
    ) {
      return res.status(503).json({
        success: false,
        message: "AI service temporarily unavailable.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to generate recommendations.",
    });
  }
};