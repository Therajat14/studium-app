import express from "express";
import { loginUSer, registerUser } from "../controllers/authController.js";

const router = express.Router();

// Example test route

// Example controller usage
router.post("/signup", registerUser);
router.get("/login", loginUSer);

export default router;
