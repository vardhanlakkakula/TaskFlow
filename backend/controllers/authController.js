import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import sendEmail from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// REGISTER USER
// ======================================================

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || "",
        token: generateToken(user._id),
      });
    }

    res.status(401).json({
      message: "Invalid email or password",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// GOOGLE LOGIN / REGISTER
// ======================================================

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google token",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        message: "Google email could not be verified",
      });
    }

    let user = await User.findOne({ email });

    // Create new Google user
    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email,
        password: await bcrypt.hash(
          `google-${googleId}-${Date.now()}`,
          10
        ),
        googleId,
        picture: picture || "",
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (picture && !user.picture) {
        user.picture = picture;
      }

      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || "",
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(
      "Google authentication error:",
      error
    );

    res.status(401).json({
      message: "Google authentication failed",
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    /*
      Security:
      We don't reveal whether the email exists.
      This prevents someone from checking which
      emails are registered in TaskFlow.
    */

    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the HASH of the token in MongoDB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 15 minutes
    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // Frontend reset-password URL
    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = "Reset your TaskFlow password";

    const text = `
Hello ${user.name || "there"},

We received a request to reset your TaskFlow password.

Click the link below to create a new password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
TaskFlow
`;

    try {
      await sendEmail(
        user.email,
        subject,
        text
      );
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError
      );

      // Remove token if email could not be sent
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await user.save();

      return res.status(500).json({
        message:
          "Unable to send password reset email. Please try again later.",
      });
    }

    return res.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    // Hash the token received from the URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid, non-expired token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Reset link is invalid or has expired.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    user.password = hashedPassword;

    // Invalidate reset token immediately
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({
      message:
        "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to reset password. Please try again.",
    });
  }
};