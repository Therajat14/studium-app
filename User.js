import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  rollNumber: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  bio: { type: String, default: "Exploring Studium..." },
  skills: [String],
  branch: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", studentSchema);