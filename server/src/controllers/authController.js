import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { signToken } from "../utils/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body.user;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "All fields (name, email, password) are required",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        // 409 Conflict is more precise
        success: false,
        msg: "User already exists",
      });
    }

    // 3. Hash password using utils
    const hashedPassword = await hashPassword(password);

    // 4. Save user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // 5. Send response (no password!)
    res.status(201).json({
      success: true,
      msg: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register User Error:", error); // logs for debugging, but not exposed to client
    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body.user;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password", // generic for security
      });
    }

    // 3. Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password", // generic
      });
    }

    // 4. Generate token
    const token = signToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 5. Respond with safe user data
    res.status(200).json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login User Error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};
