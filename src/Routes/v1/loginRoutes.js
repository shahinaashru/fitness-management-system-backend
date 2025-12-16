const express = require("express");
const loginRouter = express.Router();
const {
  registerValidation,
  loginValidation,
} = require("../../Middlewares/userValidator");
const authMiddleware = require("../../Middlewares/authMiddleware");
const {
  login,
  register,
  logout,
} = require("../../Controllers/loginController");
loginRouter.post("/login", loginValidation, login);
loginRouter.post("/register", registerValidation, register);
loginRouter.post("/logout", logout);
module.exports = loginRouter;
