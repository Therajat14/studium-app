import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Use Morgan for request logging
app.use(morgan("dev"));

// Middleware to parse JSON requests
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
