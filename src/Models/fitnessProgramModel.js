const mongoose = require("mongoose");

fitnessProgramSchema = new mongoose.Schema(
  {
    program_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    suitable_for: {
      type: String,
      required: true,
    },
    goal_type: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    number_of_sessions: {
      type: Number,
      required: true,
    },
    session_duration: {
      type: String,
      required: true,
    },
    workout_plan: {
      type: String,
    },
    nutrition_plan: {
      type: String,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trainer",
    },
    cost: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("fitnessProgram", fitnessProgramSchema);
