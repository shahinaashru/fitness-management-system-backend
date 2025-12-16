const asyncHandler = require("../Middlewares/asyncHandler");
const userDB = require("../Models/userModel");
const uploadToCloudinary = require("../Utilities/imageUpload");
const cloudinary = require("../config/cloudinaryConfig");
const trainerDB = require("../Models/trainerModel");
const orderDB = require("../Models/orderModel");
const dailyActivityDB = require("../Models/dailyActivityModel");
const programDB = require("../Models/fitnessProgramModel");
weeklyPlanDB = require("../Models/weeklyPlanModel");
exports.createProfile = asyncHandler(async (req, res) => {
  const { fullname, age, gender, height, weight, fitness_goals } = req.body;
  const loginId = req.user._id;
  const existingUser = await userDB.findOne({ loginId });
  if (existingUser) {
    return res.status(400).json({ message: "Profile already created" });
  }
  let cloudinaryRes = null;
  if (req.file) {
    cloudinaryRes = await uploadToCloudinary(req.file.path);
  }
  const newUser = await userDB.create({
    fullname,
    age,
    gender,
    height,
    weight,
    fitness_goals,
    loginId,
    image: cloudinaryRes,
  });
  return res.status(201).json({
    success: true,
    message: "User profile created successfully",
    user: newUser,
  });
});
exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullname, age, gender, height, weight, fitness_goals } = req.body;
  const { id } = req.params;
  let user = await userDB.findById(id);
  console.log(user);
  if (!user) {
    return res.status(400).json({ message: "User not exist" });
  }
  const updatedData = await userDB.findOneAndUpdate(
    { _id: id },
    {
      fullname,
      age,
      gender,
      height,
      weight,
      fitness_goals,
    },
    { new: true }
  );
  if (updatedData) {
    return res
      .status(201)
      .json({ message: "User profile updated succesfully", user: updatedData });
  }
});
exports.getProfile = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  let user = await userDB.findOne({ loginId }).populate("loginId", "email");
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  return res.status(201).json({
    message: "User data retrieved succesfully",
    user: user,
  });
});
exports.getUsers = asyncHandler(async (req, res) => {
  let user = await userDB.find().populate({
    path: "loginId",
    select: "email -_id",
    match: { role: "user" },
  });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  return res.status(201).json({
    message: "User data retrieved succesfully",
    user: user,
  });
});
exports.getUsersByOrder = asyncHandler(async (req, res) => {
  if (req.user.role === "user") {
    return res.status(404).json({
      message: "Trainer can only access these function",
    });
  }
  let loginId = req.user._id;
  let trainerData = await trainerDB.findOne({ loginId });
  let trainer = trainerData._id;
  let orders = await orderDB.find({ trainer });

  if (!orders || orders.length === 0) {
    return res.status(404).json({
      message: "No orders found for this trainer",
    });
  }
  let userIds = orders.map((order) => order.user.toString());
  userIds = [...new Set(userIds)];

  if (userIds.length === 0) {
    return res.status(404).json({
      message: "No users found in orders",
    });
  }
  let users = await userDB.find({ _id: { $in: userIds } }).populate({
    path: "loginId",
    select: "email -_id",
    match: { role: "user" },
  });
  if (!users) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  return res.status(201).json({
    message: "User data retrieved succesfully",
    users: users,
  });
});
exports.getChatUsersUnderTrainer = asyncHandler(async (req, res) => {
  if (req.user.role === "user") {
    return res.status(403).json({
      message: "Only trainers can access this function",
    });
  }
  const trainerData = await trainerDB.findOne({ loginId: req.user._id });
  if (!trainerData) {
    return res.status(404).json({ message: "Trainer not found" });
  }

  const trainerId = trainerData._id;
  const orders = await orderDB.find({ trainer: trainerId });
  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json({ message: "No orders found for this trainer" });
  }
  let userIds = [...new Set(orders.map((order) => order.user.toString()))];
  if (userIds.length === 0) {
    return res.status(404).json({ message: "No users found in orders" });
  }
  const users = await userDB
    .find({ _id: { $in: userIds } })
    .select("fullname loginId -_id");

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "Users not found" });
  }

  return res.status(200).json({
    message: "User data retrieved successfully",
    users,
  });
});
exports.getUsersCountUnderTrainer = asyncHandler(async (req, res) => {
  if (req.user.role === "user") {
    return res.status(403).json({
      message: "Only trainers can access this function",
    });
  }
  const trainerData = await trainerDB.findOne({ loginId: req.user._id });
  if (!trainerData) {
    return res.status(404).json({ message: "Trainer not found" });
  }

  const trainerId = trainerData._id;
  const orders = await orderDB.find({ trainer: trainerId });
  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json({ message: "No orders found for this trainer" });
  }
  let userIds = [...new Set(orders.map((order) => order.user.toString()))];
  if (userIds.length === 0) {
    return res.status(404).json({ message: "No users found in orders" });
  }
  const users = await userDB
    .find({ _id: { $in: userIds } })
    .select("fullname age gender loginId -_id");

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "Users not found" });
  }
  const totalUsers = users.length;
  const maleCount = users.filter((user) => user.gender === "male").length;
  const femaleCount = users.filter((user) => user.gender === "female").length;
  const age1825 = users.filter(
    (user) => user.age >= 18 && user.age <= 25
  ).length;
  const age2635 = users.filter(
    (user) => user.age >= 26 && user.age <= 35
  ).length;
  const age3645 = users.filter(
    (user) => user.age >= 36 && user.age <= 45
  ).length;

  res.status(200).json({
    message: "User data retrieved successfully",
    totalUsers,
    maleCount,
    femaleCount,
    age1825,
    age2635,
    age3645,
  });
});
exports.getUserDashboardTopData = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Only users can access this function",
    });
  }
  const loginId = req.user._id;
  const userData = await userDB.findOne({ loginId });
  if (!userData) {
    return res.status(404).json({ message: "User not found" });
  }
  const user = userData._id;
  const distinctProgramIds = await orderDB.distinct("program", { user });
  const programs = await programDB
    .find({ _id: { $in: distinctProgramIds } })
    .select("program_name number_of_sessions");
  const totalSessionsCount = programs.reduce(
    (sum, program) => sum + (program.number_of_sessions || 0),
    0
  );
  const activeProgramsCount = programs.length;
  const activeProgramNames = programs.map((p) => p.program_name).join(", ");
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const weeklyplan = await weeklyPlanDB.findOne({ user });
  let todayWorkoutCount = 0;
  if (weeklyplan) {
    const todayPlan = weeklyplan.weeklyPlan.find((plan) => plan.day === today);
    todayWorkoutCount = todayPlan ? todayPlan.workouts.length : 0;
  }
  const dailyActivityDates = await dailyActivityDB.distinct("date", {
    user,
    workoutStatus: "completed",
  });
  const completedTaskCount = dailyActivityDates.length;
  const overallProgress =
    totalSessionsCount > 0
      ? Math.round((completedTaskCount / totalSessionsCount) * 100)
      : 0;
  const userStats = [
    {
      title: "Active Programs",
      value: activeProgramsCount.toString(),
      subtitle: activeProgramNames || "No active programs",
      color: "bg-blue-500",
    },
    {
      title: "Today's Tasks",
      value: todayWorkoutCount.toString(),
      subtitle: "Tasks scheduled for today",
      color: "bg-orange-500",
    },
    {
      title: "Completed Tasks",
      value: completedTaskCount.toString(),
      subtitle: "Tasks you have completed",
      color: "bg-green-500",
    },
    {
      title: "Overall Progress",
      value: `${overallProgress}%`,
      subtitle: "Program completion",
      color: "bg-purple-500",
    },
  ];

  return res.status(200).json({
    message: "User dashboard data retrieved successfully",
    userStats,
    userDetails: {
      height: userData.height,
      weight: userData.weight,
      age: userData.age,
    },
  });
});
exports.getTodaysActivity = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Only users can access this function",
    });
  }
  const loginId = req.user._id;
  const userData = await userDB.findOne({ loginId });
  if (!userData) {
    return res.status(404).json({ message: "User not found" });
  }
  const user = userData._id;
  const distinctProgramIds = await orderDB.distinct("program", { user });
  const programs = await programDB
    .find({ _id: { $in: distinctProgramIds } })
    .select("program_name number_of_sessions");
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const weeklyplan = await weeklyPlanDB.findOne({ user });
  let todayPlan = [];
  if (weeklyplan) {
    todayPlan = weeklyplan.weeklyPlan.find((plan) => plan.day === today);
  }
  return res.status(200).json({
    message: "User dashboard data retrieved successfully",
    todayWorkoutPlan: todayPlan,
  });
});
exports.getActivePrograms = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Only users can access this function",
    });
  }
  const loginId = req.user._id;
  const userData = await userDB.findOne({ loginId });
  if (!userData) {
    return res.status(404).json({ message: "User not found" });
  }
  const user = userData._id;
  const distinctProgramIds = await orderDB.distinct("program", { user });
  const programs = await programDB
    .find({ _id: { $in: distinctProgramIds } })
    .select("program_name trainer")
    .populate({
      path: "trainer",
      select: "fullname",
    });
  return res.status(200).json({
    message: "User dashboard data retrieved successfully",
    programs: programs,
  });
});
