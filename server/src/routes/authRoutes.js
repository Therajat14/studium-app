import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// Example test route

// Example controller usage
router.post("/signup", registerUser);
router.post("/login", loginUser);

export default router;
