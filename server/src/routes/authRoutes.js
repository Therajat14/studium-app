import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/authSchemas.js";

const router = express.Router();

// Example test route

// Example controller usage
router.post("/signup", registerUser);
// router.post("/login", validate(loginSchema), loginUser);
router.post("/login", loginUser);
router.get("/me", (req, res) => res.send("user"));

export default router;
