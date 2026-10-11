import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan"

import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js"
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";

import {
    notFound,
    errorHandler
} from "./middleware/errorHandler.js";


const app = express();

// app.set("trust proxy", true);
app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);

// log the http
app.use(morgan("dev"));

// hide the security header
app.use(helmet());

// only allow by teh front end request
app.use(
    cors(
        {
            origin: process.env.NODE_ENV
        }));

// secure from the harmful inject form the json
app.use(express.json({limit: "20kb"}));

// helth chck
app.get("/api/health", (req, res) => {
    const connected = mongoose.connection.readyState === 1;

    return res.status(connected ? 200:503 ).json({
        success: connected,
        message: connected
            ? "LearnPath AI API is running."
            : "Database Unable to connect to the database.",
        database: connected ? "connected" : "disconnected"
    });
});

// auth router
app.use("/api/auth", authRoutes);

// course router
app.use("/api/courses",courseRoutes)

// enrollment router
app.use("/api/enrollments", enrollmentRoutes);

// instructor only enroll management  
app.use("/api/instructor", instructorRoutes);

// unknown route handler
app.use(notFound);

// any other error handle
app.use(errorHandler);

export default app;
