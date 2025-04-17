import mongoose from "mongoose";

const DB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);

    console.log(`Connected to database`);
  } catch (error) {
    console.error("Error connecting to database: ", error);

    process.exit(1);
  }
};

export default connectDB;
