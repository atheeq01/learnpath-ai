import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: 3,
        maxLength: 30,

    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ["student", "instructor"],
        required: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model('User', UserSchema);

