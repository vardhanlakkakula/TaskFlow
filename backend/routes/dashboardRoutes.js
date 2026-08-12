import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected Dashboard Route
router.get("/", protect, (req, res) => {
  res.json({
    message: "Dashboard accessed successfully",
    user: req.user,
  });
});

export default router;