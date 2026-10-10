import Course from "../models/Course.js";


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
export const getCourse = async (req,res)=>{
    const courses = await Course.find({})
        .select(
            "title description category level instructorId createdAt updatedAt"
        )
        .sort ({createdAt:-1 , _id:-1})
        .lean();

    return res.status(200).json({
    success: true,
    message: "Courses retrieved successfully",
    count: courses.length,
    courses,
  });
}