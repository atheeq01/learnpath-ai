import jwt from "jsonwebtoken";
import User from "../models/User.js";

// authentication middleware (cehck the token )
export const authenticate = async (req, res, next) => {
    const authorization = req.get("authorization");

    if (!authorization) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        })
    }

    const match = authorization.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization header",
        });
    }

    const token = match[1];

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || jwtSecret.length < 32) {
        throw new Error("JWT_SECRET is missing or too short");
    }
    let decoded;

    try {
        decoded = jwt.verify(token, jwtSecret, {
            algorithms: ["HS256"],
        })
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            })
        }
        return res.status(401).json({
            success: false,
            message: "Invalid Token",
        });
    }

    if (
        !decoded ||
        typeof decoded !== "object" ||
        typeof decoded.id !== "string" ||
        !/^[0-9a-fA-F]{24}$/.test(decoded.id)
    ) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    const user = await User.findById(decoded.id)
        .select("name username email role");
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "User no longer exists",
        })
    }
    req.user = {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
    };

    next();

}
