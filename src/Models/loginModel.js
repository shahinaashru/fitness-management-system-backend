const mongoose = require("mongoose");

loginSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "trainer", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("login", loginSchema);
