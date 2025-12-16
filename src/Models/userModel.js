const mongoose = require("mongoose");

userSchema = new mongoose.Schema(
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
    age: Number,
    gender: String,
    height: String,
    weight: String,
    fitness_goals: String,
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);
