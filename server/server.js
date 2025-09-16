import "dotenv/config";

import express from "express";
import morgan from "morgan";
import cors from "cors";

import { connectDB } from "./src/utils/db.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();

connectDB();

// Middlewares

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
// Routes

app.use("/api/auth", authRoutes);

// Server
app.listen(3000, () => console.log("server running on port 3000"));
