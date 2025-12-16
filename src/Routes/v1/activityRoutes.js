const express = require("express");
const activityRouter = express.Router();
const authMiddleware = require("../../Middlewares/authMiddleware");
const {
  addDailyActivity,
  updateDailyActivity,
  getUsersActForTrainer,
  // getDailyActivities,
  addWeeklyPlan,
  getWeeklyPlan,
  // getWeeklyPlanByDate,
  getFilteredWeeklyPlan,
} = require("../../Controllers/activityController");
activityRouter.get(
  "/usersact-trainer/:date",
  authMiddleware,
  getUsersActForTrainer
);
activityRouter.post("/", authMiddleware, addDailyActivity);
activityRouter.post("/add-weeklyplan", authMiddleware, addWeeklyPlan);
activityRouter.get("/get-weeklyplan", authMiddleware, getWeeklyPlan);
activityRouter.get(
  "/get-filtered-weeklyplan",
  authMiddleware,
  getFilteredWeeklyPlan
);
activityRouter.put("/:id", authMiddleware, updateDailyActivity);
module.exports = activityRouter;
