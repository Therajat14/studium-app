import User from "../models/User.js";
import { hashPassword } from "../utils/bcrypt.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
    console.error("Register User Error:", error); // ✅ logs for debugging, but not exposed to client
    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};
