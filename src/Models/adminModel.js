const mongoose = require("mongoose");

adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "admin",
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
  },
  { timestamps: true }
);
module.exports = mongoose.model("admin", adminSchema);
