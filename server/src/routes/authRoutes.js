import express from "express";
import { registerUser } from "../controllers/authController.js";

const router = express.Router();

// Example test route

// Example controller usage
router.post("/signup", registerUser);

export default router;
