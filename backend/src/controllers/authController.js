import bcrypt from "bcrypt";

import User from "../models/User.js";

export const register = async (req, res) => {
  const { name, username, email, password, role } = req.body;

  // check the user is already exist or not 
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Username or email already exists",
    });
  }

  // hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // create new user
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