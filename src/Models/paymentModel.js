const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true,
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProgramAssign",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  paymentMethod: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  paymentDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  adminCommission: {
    type: Number,
    default: 0,
  },
  trainerEarnings: {
    type: Number,
    default: 0,
  },
});
paymentSchema.pre("save", function (next) {
  const commissionRate = 0.1;
  this.adminCommission = this.amount * commissionRate;
  this.trainerEarnings = this.amount - this.adminCommission;
  this.paymentDate = new Date();
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
