const mongoose = require("mongoose");

trainerSchema = new mongoose.Schema(
  {
    loginId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "login",
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    phone_number: {
      type: Number,
      required: true,
    },
    specialization: String,
    experience: String,
    verification_docs: { type: String, required: true },
    image: { type: String, require: true },
    earnings_per_session: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("trainer", trainerSchema);
