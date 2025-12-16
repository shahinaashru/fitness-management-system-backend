const asyncHandler = require("../Middlewares/asyncHandler");
const DailyActivityDB = require("../Models/dailyActivityModel");
const weeklyplanDB = require("../Models/weeklyPlanModel");
const userDB = require("../Models/userModel");
const trainerDB = require("../Models/trainerModel");
const OrderDB = require("../Models/orderModel");
const fitnessProgramDB = require("../Models/fitnessProgramModel");
exports.addDailyActivity = asyncHandler(async (req, res) => {
  const { date, workoutStatus, dietPlanStatus, programId } = req.body;
  const loginId = req.user._id;
  const userData = await userDB.findOne({ loginId });
  const user = userData._id;
  const existing = await DailyActivityDB.findOne({
    date,
    user,
    programId,
  });
  if (existing) {
    return res.status(400).json({
      error: "Daily activity already added for this date.",
    });
  }

  const result = await DailyActivityDB.create({
    date,
    workoutStatus,
    dietPlanStatus,
    programId,
    user,
    suggestion,
  });

  res.status(201).json({
    message: "Daily activity added successfully",
    data: result,
  });
});
exports.updateDailyActivity = asyncHandler(async (req, res) => {
  const { workouts, dietPlan, notes, days_remaining, suggestion, status } =
    req.body;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "activityId is required." });
  }
  const activity = await DailyActivityDB.findById(id);
  if (!activity) {
    return res.status(404).json({ message: "Daily activity not found." });
  }
  if (workouts) activity.workouts = workouts;
  if (dietPlan) activity.dietPlan = dietPlan;
  if (notes !== undefined) activity.notes = notes;
  if (days_remaining !== undefined) activity.days_remaining = days_remaining;
  if (suggestion !== undefined) activity.suggestion = suggestion;
  if (status) activity.status = status;
  await activity.save();

  res.status(200).json({
    message: "Daily activity updated successfully",
    data: activity,
  });
});
exports.getDailyActivities = asyncHandler(async (req, res) => {
  let dailyActivity = await DailyActivityDB.find();
  if (!dailyActivity) {
    return res.status(400).json({
      message: "Daily activity not found",
    });
  }
  return res.status(201).json({
    message: "Daily activities retrieved succesfully",
    dailyActivity: dailyActivity,
  });
});
exports.addWeeklyPlan = asyncHandler(async (req, res) => {
  console.log(req.body);
  const loginId = req.user._id;
  let trainer = await trainerDB.findOne({ loginId });
  const { startDate, user, weeklyPlan } = req.body;
  if (!user || !startDate || !weeklyPlan || !weeklyPlan.length) {
    return res.status(400).json({ message: "Invalid data" });
  }
  let order = await OrderDB.findOne({ user, trainer });
  program_id = order.program;
  const existing = await weeklyplanDB.findOne({ user: user, startDate });
  if (existing) {
    return res.status(409).json({
      message: "Weekly plan already exists for this user and start date",
    });
  }
  //   userId: user,
  //   startDate,
  //   day: dayPlan.day,
  //   workouts: dayPlan.workouts.map((w) => ({
  //     exercises: w.workouts || w.exercises,
  //   })),
  //   dietPlan: Object.keys(dayPlan.diet || {}).map((mealType) => ({
  //     mealType,
  //     time: dayPlan.diet[mealType].time,
  //     items: dayPlan.diet[mealType].items || [],
  //   })),
  // }));
  // const result = await weeklyplanDB.insertMany(weeklyPlans);
  const result = await weeklyplanDB.create({
    user,
    startDate,
    programId: program_id,
    weeklyPlan: weeklyPlan.map((dayPlan) => ({
      day: dayPlan.day,
      workouts: (dayPlan.workouts || []).map((w) => ({
        name: w.name,
        sets: w.sets,
        reps: w.reps,
      })),
      dietPlan: Object.keys(dayPlan.diet || {}).map((mealType) => ({
        mealType,
        time: dayPlan.diet[mealType].time,
        items: dayPlan.diet[mealType].items || [],
      })),
    })),
  });
  res.status(201).json({
    message: "Weekly plan saved successfully",
    weeklyPlan: result,
  });
});
exports.getWeeklyPlan = asyncHandler(async (req, res) => {
  let loginId = req.user._id;
  let userData = await userDB.findOne({ loginId });
  const user = userData._id;
  let weeklyPlanData = await weeklyplanDB.findOne({ user });
  if (!weeklyPlanData) {
    return res.status(404).json({
      error: "Weekly plan not found",
    });
  }
  return res.status(200).json({
    message: "Weekly plan retrieved successfully",
    data: weeklyPlanData,
  });
});
exports.getUsersActForTrainer = asyncHandler(async (req, res) => {
  const { date } = req.params;
  console.log("req.params:", req.params);
  console.log("typeof date:", typeof req.params.date);
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ message: "Invalid date format" });
  }
  const formattedDate = new Date(date);
  const loginId = req.user._id;
  let trainerData = await trainerDB.findOne({ loginId });
  const trainer = trainerData._id;
  let fitnessProgram = await fitnessProgramDB.findOne({ trainer });
  if (!fitnessProgram) {
    return res.status(400).json({
      message: "Finess program not found for this trainer",
    });
  }
  let programId = fitnessProgram._id;
  let dailyActivity = await DailyActivityDB.find({
    programId,
    date: formattedDate,
  }).populate("user", "fullname");
  if (!dailyActivity || dailyActivity.length === 0) {
    return res.status(400).json({
      message: "Daily activity not found",
    });
  }
  return res.status(201).json({
    message: "Daily activities retrieved succesfully",
    dailyActivity: dailyActivity,
  });
});
// exports.getFilteredWeeklyPlan = asyncHandler(async (req, res) => {
//   try {
//     const { user, day } = req.query;
//     let filter = {};
//     if (user) filter.user = user;
//     if (date) {
//       const start = new Date(date);
//       start.setHours(0, 0, 0, 0);
//       const end = new Date(date);
//       end.setHours(23, 59, 59, 999);
//       filter.date = { $gte: start, $lte: end };
//     }

//     const weeklyPlans = await weeklyplanDB
//       .find(filter)
//       .populate("user", "fullname");

//     if (!weeklyPlans || weeklyPlans.length === 0) {
//       return res.status(404).json({
//         message: "No weekly plans found for these filters",
//       });
//     }

//     res.status(200).json({
//       message: "Filtered weekly plans retrieved successfully",
//       data: weeklyPlans,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });

exports.getFilteredWeeklyPlan = asyncHandler(async (req, res) => {
  try {
    const { user, day } = req.query;
    let filter = {};

    if (user) filter.user = user;

    // Find all matching users
    const weeklyPlans = await weeklyplanDB
      .find(filter)
      .populate("user", "fullname");

    if (!weeklyPlans || weeklyPlans.length === 0) {
      return res.status(404).json({
        message: "No weekly plans found for these filters",
      });
    }

    // Filter weeklyPlan array for the specific day
    const filteredPlans = weeklyPlans
      .map((plan) => {
        let weeklyPlanForDay = plan.weeklyPlan;
        if (day) {
          weeklyPlanForDay = plan.weeklyPlan.filter((p) => p.day === day);
        }

        return {
          _id: plan._id,
          user: plan.user,
          startDate: plan.startDate,
          programId: plan.programId,
          weeklyPlan: weeklyPlanForDay,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      })
      .filter((p) => p.weeklyPlan.length > 0); // remove plans with empty weeklyPlan

    if (filteredPlans.length === 0) {
      return res.status(404).json({
        message: `No weekly plans found for user ${user} on ${day}`,
      });
    }

    res.status(200).json({
      message: "Filtered weekly plans retrieved successfully",
      data: filteredPlans,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});
