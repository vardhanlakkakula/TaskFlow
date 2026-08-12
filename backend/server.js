import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import startReminderJob from "./utils/reminderJob.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

// =========================
// CORS
// =========================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// =========================
// Middleware
// =========================
app.use(express.json());

// =========================
// Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/dashboard", dashboardRoutes);

// =========================
// Test Route
// =========================
app.get("/", (req, res) => {
  res.send("API Running...");
});

// =========================
// MongoDB Connection
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    // Start reminder job only after
    // successful MongoDB connection
    startReminderJob();
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// =========================
// Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});