import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";


// creating course 
export const createCourse = async (req, res) => {
    const {
        title,
        description,
        content,
        category,
        level,
    } = req.body;

    const instructorId = req.user.id;

    const course = await Course.create({
        title,
        description,
        content,
        category,
        level,
        instructorId,
    });

    return res.status(201).json(
        {
            success: true,
            message: "Course created successfully",
            course: {
                _id: course._id.toString(),
                title: course.title,
                description: course.description,
                content: course.content,
                category: course.category,
                level: course.level,
                instructorId: course.instructorId.toString(),
                createdAt: course.createdAt,
                updatedAt: course.updatedAt,
            }
        }
    )
}

// list the course 
export const getCourse = async (req, res) => {
    const courses = await Course.find({ isDeleted: { $ne: true } })
        .select(
            "title description category level instructorId createdAt updatedAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        message: "Courses retrieved successfully",
        count: courses.length,
        courses,
    });
}

// get the course using the id 
export const getCourseById = async (req, res) => {
    const { id } = req.params;

    const course = await Course.findById(id)
        .select(
            "title description content category level instructorId createdAt updatedAt"
        )
        .lean();

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Course retrieved successfully",
        course,
    });
};

// update the course (role : instructor who owns the course )
export const updateCourse = async (req, res) => {
    const { id } = req.params;

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
            message: "You can only update your own courses",
        });
    }
    course.set(req.body);
    await course.save();

    return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course,
    });
}


// delete the course when the users not enrolled 
export const deleteCourse = async (req, res) => {
    const { id } = req.params;
    let unenrolledCount = 0;

    try {
        await mongoose.connection.transaction(async (session) => {
            const course = await Course.findById(id).session(session);

            if (!course || course.isDeleted) {
                throw Object.assign(new Error("Course not found"), {
                    statusCode: 404,
                });
            }

            if (course.instructorId.toString() !== req.user.id) {
                throw Object.assign(
                    new Error("You can only delete your own courses"),
                    { statusCode: 403 }
                );
            }

            const now = new Date();

            course.isDeleted = true;
            course.deletedAt = now;

            await course.save({ session });

            const result = await Enrollment.updateMany(
                {
                    courseId: course._id,
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
                            reason: "course_archived",
                        },
                    },
                },
                { session, runValidators: true }
            );

            unenrolledCount = result.modifiedCount;
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        throw error;
    }

    return res.status(200).json({
        success: true,
        message: "Course archived successfully",
        unenrolledCount,
    });
};