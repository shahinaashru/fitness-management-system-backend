const express = require("express");
const userRouter = express.Router();
const upload = require("../../Middlewares/multer");
const {
  registerValidation,
  loginValidation,
} = require("../../Middlewares/userValidator");
const authMiddleware = require("../../Middlewares/authMiddleware");
const {
  // login,
  // register,
  createProfile,
  updateProfile,
  getProfile,
  getUsers,
  getUsersByOrder,
  getChatUsersUnderTrainer,
  getUsersCountUnderTrainer,
  getUserDashboardTopData,
  getTodaysActivity,
  getActivePrograms,
  // logout,
} = require("../../Controllers/userController");
// userRouter.post("/login", login);
// userRouter.post("/register", registerValidation, register);
userRouter.post("/", authMiddleware, upload.single("image"), createProfile);
userRouter.put("/:id", authMiddleware, updateProfile);
userRouter.get("/", authMiddleware, getProfile);
userRouter.get("/users", getUsers);
userRouter.get("/usersby-order", authMiddleware, getUsersByOrder);
userRouter.get("/chatusers-trainer", authMiddleware, getChatUsersUnderTrainer);
userRouter.get("/users-count", authMiddleware, getUsersCountUnderTrainer);
userRouter.get("/dashboard-topdata", authMiddleware, getUserDashboardTopData);
userRouter.get("/today-activity", authMiddleware, getTodaysActivity);
userRouter.get("/active-programs", authMiddleware, getActivePrograms);
// userRouter.post("/logout", logout);
module.exports = userRouter;
