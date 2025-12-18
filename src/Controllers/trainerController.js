const asyncHandler = require("../Middlewares/asyncHandler");
const trainerDB = require("../Models/trainerModel");
const loginDB = require("../Models/loginModel");
const cloudinaryFuncs = require("../utilities/fileUpload");
const userDB = require("../Models/userModel");
const orderDB = require("../Models/orderModel");
const PersonalSession = require("../Models/personalSessionModel");
exports.createProfile = asyncHandler(async (req, res) => {
  const {
    fullname,
    phone_number,
    specialization,
    experience,
    earnings_per_session,
  } = req.body;

  const loginId = req.user._id;
  const existingTrainer = await trainerDB.findOne({ loginId });
  if (existingTrainer) {
    return res.status(400).json({ message: "Trainer profile already created" });
  }
  const imageFile = req.files?.image?.[0];
  const docFile = req.files?.verification_docs?.[0];

  if (!imageFile) return res.status(400).json({ error: "Image is required" });
  if (!docFile)
    return res.status(400).json({ error: "Verification document is required" });
  const cloudinaryImage = await cloudinaryFuncs.imageUploadToCloudinary(
    imageFile.buffer,
    "trainer_images"
  );

  const cloudinaryDoc = await cloudinaryFuncs.fileUploadToCloudinary(
    docFile.buffer,
    "trainer_documents"
  );
  const newTrainer = await trainerDB.create({
    fullname,
    phone_number,
    specialization,
    experience,
    earnings_per_session,
    loginId,
    image: cloudinaryImage.secure_url,
    verification_docs: cloudinaryDoc.secure_url,
  });

  return res.status(201).json({
    message: "Trainer profile created successfully",
    trainer: newTrainer,
  });
});
exports.updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    fullname,
    phone_number,
    specialization,
    experience,
    earnings_per_session,
  } = req.body;
  let trainer = await trainerDB.findById(id);
  if (!trainer) {
    return res.status(404).json({ message: "Trainer profile not found" });
  }
  if (trainer.loginId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  if (req.files?.image?.[0]) {
    const cloudinaryImage = await cloudinaryFuncs.imageUploadToCloudinary(
      req.files.image[0].buffer,
      "trainer_images"
    );
    trainer.image = cloudinaryImage.secure_url;
  }
  if (req.files?.verification_docs?.[0]) {
    const cloudinaryDoc = await cloudinaryFuncs.fileUploadToCloudinary(
      req.files.verification_docs[0].buffer,
      "trainer_documents"
    );
    trainer.verification_docs = cloudinaryDoc.secure_url;
  }
  trainer.fullname = fullname || trainer.fullname;
  trainer.phone_number = phone_number || trainer.phone_number;
  trainer.specialization = specialization || trainer.specialization;
  trainer.experience = experience || trainer.experience;
  trainer.earnings_per_session =
    earnings_per_session || trainer.earnings_per_session;

  await trainer.save();

  return res.status(200).json({
    message: "Trainer profile updated successfully",
    trainer,
  });
});
exports.getProfile = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  let trainer = await trainerDB
    .findOne({ loginId })
    .populate("loginId", "email");
  return res.status(201).json({
    message: "Trainer data retrieved succesfully",
    trainer: trainer,
  });
});
exports.getTrainers = asyncHandler(async (req, res) => {
  let trainer = await trainerDB.find().populate({
    path: "loginId",
    select: "email -_id",
    match: { role: "trainer" },
  });
  if (!trainer) {
    return res.status(400).json({
      message: "No trainer found",
    });
  }
  return res.status(201).json({
    message: "Trainers details retrieved succesfully",
    trainer: trainer,
  });
});
exports.getTrainerForChat = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const userData = await userDB.findOne({ loginId });
  if (!userData) {
    return res.status(400).json({ message: "User not found" });
  }
  const userId = userData._id;
  const orders = await orderDB.findOne({ user: userId });
  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json({ message: "No orders found for this trainer" });
  }
  const id = orders.trainer;
  const trainer = await trainerDB.findById(id).select("loginId fullname -_id");
  console.log(trainer);
  if (!trainer) {
    return res.status(400).json({ message: "Trainer not found for this user" });
  }
  return res.status(200).json({
    message: "Trainer data retrieved successfully",
    trainer: trainer,
  });
});
exports.getDashboardCount = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  let trainer = await trainerDB.findOne({ loginId });
  const trainerId = trainer._id;
  const totalOrders = await orderDB.countDocuments({
    trainer: trainerId,
    paymentStatus: "success",
    order_type: "program",
  });
  const uniqueUsers = await orderDB.distinct("user", {
    trainer: trainerId,
    paymentStatus: "success",
  });
  const usersCount = uniqueUsers.length;
  const totalPersonalSessions = await PersonalSession.countDocuments({
    trainerId,
    paymentStatus: "paid",
    status: "confirmed",
  });
  const today = new Date().toISOString().split("T")[0];
  const todaysPersonalSessions = await PersonalSession.countDocuments({
    trainerId,
    sessionDate: today,
    paymentStatus: "paid",
    status: "confirmed",
  });
  return res.status(200).json({
    message: "Dashbors Datas count retrived successfully",
    totalOrders: totalOrders,
    totalUsers: usersCount,
    totalSessions: totalPersonalSessions,
    todaysSessions: todaysPersonalSessions,
  });
});
exports.getWeeklyEarningsThisMonth = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const trainer = await trainerDB.findOne({ loginId });
  if (!trainer) {
    return res.status(404).json({ message: "Trainer not found" });
  }
  const trainerId = trainer._id;
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const data = await orderDB.aggregate([
    {
      $match: {
        trainer: trainerId,
        paymentStatus: "success",
      },
    },
    {
      $addFields: {
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      },
    },
    {
      $match: { month: currentMonth },
    },
    {
      $addFields: {
        week: { $ceil: { $divide: ["$day", 7] } },
      },
    },
    {
      $group: {
        _id: "$week",
        earnings: { $sum: "$trainerShare" },
        orders: { $sum: 1 },
      },
    },
  ]);
  const weekMap = { 1: 0, 2: 0, 3: 0, 4: 0 };

  data.forEach((item) => {
    weekMap[item._id] = item.earnings;
  });
  const response = [1, 2, 3, 4].map((w) => ({
    week: "week" + w,
    earnings: weekMap[w] || 0,
  }));

  return res.status(200).json({
    message: "Week-wise earnings for current month retrieved successfully",
    month: currentMonth,
    data: response,
  });
});
exports.getMonthlyEarningsThisYear = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const trainer = await trainerDB.findOne({ loginId });
  if (!trainer) {
    return res.status(404).json({ message: "Trainer not found" });
  }
  const trainerId = trainer._id;
  const currentYear = new Date().getFullYear();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const earningsData = await orderDB.aggregate([
    {
      $match: {
        trainer: trainerId,
        paymentStatus: "success",
      },
    },
    {
      $addFields: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      },
    },
    {
      $match: {
        year: currentYear,
      },
    },
    {
      $group: {
        _id: "$month",
        totalEarnings: { $sum: "$trainerShare" },
        count: { $sum: 1 },
      },
    },
  ]);
  const earningsMap = {};
  earningsData.forEach((item) => {
    earningsMap[item._id] = {
      earnings: item.totalEarnings,
      orders: item.count,
    };
  });
  const yearlyArray = monthNames.map((name, index) => {
    const monthNumber = index + 1;

    return {
      month: name,
      monthNumber,
      year: currentYear,
      earnings: earningsMap[monthNumber]?.earnings || 0,
      orders: earningsMap[monthNumber]?.orders || 0,
    };
  });

  return res.status(200).json({
    message: `Yearly earnings (Jan–Dec) for ${currentYear} retrieved successfully`,
    data: yearlyArray,
  });
});
exports.getDailyEarningsThisWeek = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const trainer = await trainerDB.findOne({ loginId });
  if (!trainer) {
    return res.status(404).json({ message: "Trainer not found" });
  }
  const trainerId = trainer._id;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const dayOfMonth = today.getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);
  const startDay = 1 + (weekNumber - 1) * 7;
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const endDay = Math.min(startDay + 6, lastDayOfMonth);

  const weekStart = new Date(year, month, startDay);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(year, month, endDay);
  weekEnd.setHours(23, 59, 59, 999);
  const data = await orderDB.aggregate([
    {
      $match: {
        trainer: trainerId,
        paymentStatus: "success",
        createdAt: { $gte: weekStart, $lte: weekEnd },
      },
    },
    {
      $addFields: {
        dateOnly: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    {
      $group: {
        _id: "$dateOnly",
        earnings: { $sum: "$trainerShare" },
      },
    },
  ]);
  const dailyMap = {};
  data.forEach((item) => {
    dailyMap[item._id] = item.earnings;
  });
  const finalData = [];
  for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
    const formatted = d.toISOString().split("T")[0];
    finalData.push({
      date: formatted,
      amount: dailyMap[formatted] || 0,
    });
  }

  return res.status(200).json({
    message: `Daily earnings for week ${weekNumber} of the month retrieved successfully`,
    month: month + 1,
    year,
    weekNumber,
    weekStart,
    weekEnd,
    data: finalData,
  });
});
