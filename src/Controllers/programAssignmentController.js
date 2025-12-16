const asyncHandler = require("../Middlewares/asyncHandler");
const fitnessAssignDB = require("../Models/programAssignModel");
exports.assignFitnessProgram = asyncHandler(async (req, res) => {
  const { trainerId, userId, programId, goal, startDate, endDate } = req.body;
  const existing = await fitnessAssignDB.findOne({
    trainerId,
    userId,
    programId,
    status: { $in: ["pending", "active"] },
  });

  if (existing) {
    return res.status(400).json({
      message: "Program already assigned to this user by this trainer.",
    });
  }
  const newAssignment = new fitnessAssignDB({
    trainerId,
    userId,
    programId,
    goal,
    startDate,
    endDate,
    status: "pending",
  });
  await newAssignment.save();
  res.status(201).json({
    message: "Program successfully assigned to user",
    data: newAssignment,
  });
});
exports.programStatusChange = asyncHandler(async (req, res) => {
  const { assignmentId, status } = req.body;
  const assignment = await fitnessAssignDB.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({
      message: "Program assignment not found",
    });
  }
  assignment.status = status;
  await assignment.save();

  res.status(200).json({
    message: "Program status updated to active",
    data: assignment,
  });
});
exports.updateProgramAssignment = asyncHandler(async (req, res) => {
  const { trainerId, userId, programId, goal, startDate, endDate } = req.body;
  const { id } = req.params;
  console.log(id);
  let fitnessAssignment = await fitnessAssignDB.findById(id);
  console.log(fitnessAssignment);
  if (!fitnessAssignment) {
    return res.status(400).json({ message: "This program not Assigned" });
  }
  const updatedData = await fitnessAssignDB.findOneAndUpdate(
    { _id: id },
    {
      trainerId,
      userId,
      programId,
      goal,
      startDate,
      endDate,
    },
    { new: true }
  );
  if (updatedData) {
    return res.status(201).json({
      message: "Program Assigment details updated succesfully",
      user: updatedData,
    });
  }
});
exports.getProgramAssignment = asyncHandler(async (req, res) => {
  let programAssignment = await fitnessAssignDB.find();
  if (!programAssignment) {
    return res.status(400).json({
      message: "No Program Assignment found",
    });
  }
  return res.status(201).json({
    message: "Program assignments retrieved succesfully",
    programAssignment: programAssignment,
  });
});
