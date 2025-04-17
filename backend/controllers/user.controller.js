import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult, check } from "express-validator";
import redisClient from "../services/redis.service.js";

// ✅ Manual validation using express-validator in controller
const validateRegisterInput = async (req) => {
  await check("email", "Email must be valid").isEmail().run(req);
  await check("password", "Password must be at least 3 characters long")
    .isLength({ min: 3 })
    .run(req);

  return validationResult(req);
};

const validateLoginInput = async (req) => {
  await check("email", "Email must be valid").isEmail().run(req);
  await check("password", "Password is required").notEmpty().run(req);

  return validationResult(req);
};

// Register controller
export const createUserController = async (req, res) => {
  const errors = await validateRegisterInput(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await userService.createUser(req.body);
    const token = await user.generateJWT();

    delete user._doc.password;

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Login controller
export const loginController = async (req, res) => {
  const errors = await validateLoginInput(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");

    if (!user || !(await user.isValidPassword(password))) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }

    const token = await user.generateJWT();
    delete user._doc.password;

    res.status(200).json({ user, token });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

// Profile controller
export const profileController = async (req, res) => {
  res.status(200).json({ user: req.user });
};

// Logout controller
export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

// Get all users except current one
export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    const allUsers = await userService.getAllUsers({
      userId: loggedInUser._id,
    });

    return res.status(200).json({ users: allUsers });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};
