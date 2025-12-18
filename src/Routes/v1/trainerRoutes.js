const express = require("express");
const authMiddleware = require("../../Middlewares/authMiddleware");
const trainerRouter = express.Router();
const upload = require("../../Middlewares/multer2");
const {
  createProfile,
  updateProfile,
  getProfile,
  getTrainers,
  getTrainerForChat,
  getDashboardCount,
  getWeeklyEarningsThisMonth,
  getMonthlyEarningsThisYear,
  getDailyEarningsThisWeek,
} = require("../../Controllers/trainerController");
trainerRouter.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "verification_docs", maxCount: 1 },
  ]),
  createProfile
);
trainerRouter.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "verification_docs", maxCount: 1 },
  ]),
  updateProfile
);
trainerRouter.get("/", authMiddleware, getProfile);
trainerRouter.get("/get-trainers", authMiddleware, getTrainers);
trainerRouter.get("/dashbord-count", authMiddleware, getDashboardCount);
trainerRouter.get("/trainer-forchat", authMiddleware, getTrainerForChat);
trainerRouter.get(
  "/weekly-earnings",
  authMiddleware,
  getWeeklyEarningsThisMonth
);
trainerRouter.get(
  "/monthly-earnings",
  authMiddleware,
  getMonthlyEarningsThisYear
);
trainerRouter.get("/daily-earnings", authMiddleware, getDailyEarningsThisWeek);
module.exports = trainerRouter;
