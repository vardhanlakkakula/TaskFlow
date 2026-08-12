import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },

    deadline: {
      type: Date,
      default: null,
    },

    reminder: {
      type: Date,
      default: null,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Todo", todoSchema);