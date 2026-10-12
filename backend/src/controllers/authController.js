import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


// register 
export const register = async (req, res) => {
  const { name, username, email, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Username or email already exists",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    username,
    email,
    passwordHash,
    role,
  });

  // give user details
  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
};

// login and create the jwt
export const login = async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [
      { username: identifier },
      { email: identifier },
    ],
  }).select("+passwordHash");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }
  const isPasswordValid = await bcrypt
    .compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET is missing or too short")
  }

  const token = jwt.sign({
    id: user._id.toString(),
    role: user.role,
  },
    jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: "2h"
    });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

// get the current user 
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User profile retrieved successfully",
    user: {
      id: req.user.id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
