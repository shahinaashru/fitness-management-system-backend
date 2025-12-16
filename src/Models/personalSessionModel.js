const mongoose = require("mongoose");

const personalSessionSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trainer",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fitnessProgram",
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["online", "in-person"],
      default: "online",
    },
    location: {
      type: String,
    },
    cost: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["booked", "confirmed", "completed", "cancelled"],
      default: "booked",
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("personalSession", personalSessionSchema);
