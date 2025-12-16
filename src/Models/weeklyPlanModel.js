const mongoose = require("mongoose");

const weeklyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fitnessprogram",
      required: true,
    },
    weeklyPlan: [
      {
        day: String,
        workouts: [
          {
            name: String,
            sets: Number,
            reps: Number,
          },
        ],
        dietPlan: [
          {
            mealType: String,
            time: String,
            items: [
              {
                food: String,
                calories: Number,
                protein: Number,
                carbs: Number,
                fats: Number,
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("weeklyPlan", weeklyPlanSchema);
