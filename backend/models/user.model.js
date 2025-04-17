import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [6, "Email must be at least 6 characters long"],
    maxLength: [50, "Email must not be longer than 50 characters"],
  },

  password: {
    type: String,
    required: true,
    select: false, // hide by default
  },
});

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// Use statics when you want to define a utility/helper function that doesn't need access to a specific user document, like:

//     Hashing a plain password before saving

//     Finding users by a custom criteria

//     Aggregating data
//you can call it like this
// const password=await userModel.hashPassword(password)

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
// This is a method that is called on a specific user document.
//Use methods when you want to operate on a single document and need access to its properties (like this.email or this.password).

userSchema.methods.generateJWT = function () {
  return jwt.sign({ email: this.email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const User = mongoose.model("user", userSchema);

export default User;
