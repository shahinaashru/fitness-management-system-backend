const asyncHandler = require("../Middlewares/asyncHandler");
const uploadToCloudinary = require("../Utilities/imageUpload");
const fitnessProgramDB = require("../Models/fitnessProgramModel");
const trainerDB = require("../Models/trainerModel");
const orderDB = require("../Models/orderModel");
const userDB = require("../Models/userModel");
const cloudinary = require("../config/cloudinaryConfig");
exports.listFitnessPrograms = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const loginId = req.user._id;
  let fitnessPrograms = [];
  if (userRole == "trainer") {
    let trainerData = await trainerDB.findOne({ loginId });
    let trainer = trainerData._id;
    fitnessPrograms = await fitnessProgramDB.find({ trainer });
  } else {
    fitnessPrograms = await fitnessProgramDB.find();
  }
  if (!fitnessPrograms) {
    return res.status(400).json({
      message: "Fitness programs not exist",
    });
  }
  return res.status(201).json({
    message: "Fitness programs retrieved succesfully",
    fitness_programs: fitnessPrograms,
  });
});
exports.listFitnessProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let fitnessProgram = await fitnessProgramDB
    .findById(id)
    .populate("trainer", "fullname");
  if (!fitnessProgram) {
    return res.status(400).json({
      message: "Fitness programs not exist",
    });
  }
  return res.status(201).json({
    message: "Fitness program retrieved succesfully",
    fitness_program: fitnessProgram,
  });
});
exports.getMyFitnessPrograms = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  let userData = await userDB.findOne({ loginId });
  if (!userData) {
    return res.status(404).json({ message: "User not found" });
  }
  const user = userData._id;
  let orderData = await orderDB.find({
    user,
    paymentStatus: "success",
  });

  if (!orderData.length) {
    return res.status(404).json({
      message: "No purchased fitness programs found",
    });
  }
  const fitnessPrograms = [];
  for (let order of orderData) {
    const programId = order.program;
    let program = await fitnessProgramDB
      .findById(programId)
      .populate("trainer", "fullname");
    if (program) {
      fitnessPrograms.push(program);
    }
  }

  return res.status(200).json({
    message: "Fitness programs retrieved successfully",
    fitness_programs: fitnessPrograms,
  });
});
exports.createFitnessProgram = asyncHandler(async (req, res) => {
  const {
    program_name,
    description,
    suitable_for,
    goal_type,
    duration,
    workout_plan,
    nutrition_plan,
    number_of_sessions,
    session_duration,
    cost,
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Image not found" });
  }

  const existingProgram = await fitnessProgramDB.findOne({ program_name });
  if (existingProgram) {
    return res.status(400).json({
      message: "Fitness program already exists with this name",
      fitness_program: existingProgram,
    });
  }

  const cloudinaryRes = await uploadToCloudinary(req.file.path);
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: user not logged in" });
  }

  let trainer;

  if (req.user.role === "admin" && req.body.trainerId) {
    trainer = req.body.trainerId;
  } else {
    const trainerData = await trainerDB.findOne({ loginId: req.user._id });
    if (!trainerData) {
      return res.status(400).json({ error: "Trainer data not found" });
    }
    trainer = trainerData._id;
  }

  const newProgram = new fitnessProgramDB({
    program_name,
    description,
    suitable_for,
    goal_type,
    duration,
    workout_plan,
    nutrition_plan,
    number_of_sessions,
    session_duration,
    cost,
    image: cloudinaryRes,
    trainer: trainer,
  });

  const saved = await newProgram.save();

  return res.status(201).json({
    message: "Fitness program added successfully",
    fitness_program: newProgram,
  });
});
exports.updateFitnessProgram = asyncHandler(async (req, res) => {
  const {
    program_name,
    goal_type,
    duration,
    workout_plan,
    nutrition_plan,
    number_of_sessions,
    session_duration,
    cost,
  } = req.body;
  const { id } = req.params;
  console.log(id);
  let fitnessProgram = await fitnessProgramDB.findById(id);
  console.log(fitnessProgram);
  if (!fitnessProgram) {
    return res.status(400).json({ message: "Fitness Program not exist" });
  }
  const updatedData = await fitnessProgramDB.findOneAndUpdate(
    { _id: id },
    {
      program_name,
      goal_type,
      duration,
      workout_plan,
      nutrition_plan,
      number_of_sessions,
      session_duration,
      cost,
    },
    { new: true }
  );
  if (updatedData) {
    return res.status(201).json({
      message: "Fitness Program updated succesfully",
      fitness_program: updatedData,
    });
  }
});
