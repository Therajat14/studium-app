import express from "express";
import dotenv from "dotenv";

import morgan from "morgan";
import { connectDB } from "./src/utils/db.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
dotenv.config();
connectDB();

// Middlewares
app.use(morgan("dev"));
app.use(express.json()); // <-- useful if you’re handling JSON requests

// Routes

app.use("/", authRoutes);

// Server
app.listen(3000, () => console.log("server running on port 3000"));
