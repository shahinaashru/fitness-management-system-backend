const mongoose = require("mongoose");

const dailyActivitySchema = new mongoose.Schema(
  {
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FitnessProgram",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    workoutStatus: {
      type: String,
      enum: ["pending", "skipped", "completed"],
      default: "pending",
    },
    dietPlanStatus: {
      type: String,
      enum: ["pending", "skipped", "completed"],
      default: "pending",
    },
    days_remaining: {
      type: Number,
    },
    suggestion: String,
  },
  { timestamps: true }
);

// Automatically calculate endDate
// programAssignSchema.pre("save", function (next) {
//   if (this.startDate && this.durationWeeks) {
//     this.endDate = new Date(
//       this.startDate.getTime() + this.durationWeeks * 7 * 24 * 60 * 60 * 1000
//     );
//   }
//   next();
// });

module.exports = mongoose.model("dailyActivity", dailyActivitySchema);
