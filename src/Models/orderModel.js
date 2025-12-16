const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trainer",
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fitnessProgram",
      required: true,
    },
    order_type: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    adminShare: {
      type: Number,
      required: true,
    },
    trainerShare: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
