import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Conncected To DB successfully");
  } catch (error) {
    console.log({
      msg: error.message,
    });
    process.exit(1);
  }
};
