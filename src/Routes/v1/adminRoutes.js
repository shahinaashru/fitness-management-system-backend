const express = require("express");
const adminRouter = express.Router();
const {
  login,
  register,
  logout,
  createUser,
} = require("../../Controllers/adminController");
const authMiddleware = require("../../Middlewares/authMiddleware");
// adminRouter.post("/login", login);
// adminRouter.post("/register", register);
// adminRouter.post("/logout", logout);
adminRouter.post("/create-user", authMiddleware, createUser);
module.exports = adminRouter;
