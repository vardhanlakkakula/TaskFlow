import express from "express";

import {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Normal registration
router.post("/register", registerUser);

// Normal login
router.post("/login", loginUser);

// Google login / registration
router.post("/google", googleLogin);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password/:token", resetPassword);

export default router;