const mongoose = require("mongoose");

const programAssignSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FitnessProgram",
      required: true,
    },
    goal: {
      type: String,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Automatically calculate endDate
programAssignSchema.pre("save", function (next) {
  if (this.startDate && this.durationWeeks) {
    this.endDate = new Date(
      this.startDate.getTime() + this.durationWeeks * 7 * 24 * 60 * 60 * 1000
    );
  }
  next();
});

module.exports = mongoose.model("ProgramAssign", programAssignSchema);
