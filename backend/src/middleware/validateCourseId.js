import mongoose from "mongoose";

export const validateCourseId= (req,res,next) =>{
    const {id} = req.params;

    if(!mongoose.isObjectIdOrHexString(id)){
        return res.status(400).json({
            success : false,
            message: "Invalid course ID",
        })
    }
    next();
}