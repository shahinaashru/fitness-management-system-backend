const PersonalSession = require("../Models/personalSessionModel");
const userDB = require("../Models/userModel");
const trainerDB = require("../Models/trainerModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.SECRET_STRIPE);
const asyncHandler = require("../Middlewares/asyncHandler");
const OrderDB = require("../Models/orderModel");
exports.addPersonalSession = asyncHandler(async (req, res) => {
  const {
    trainerId,
    programId,
    sessionDate,
    startTime,
    endTime,
    mode,
    location,
    cost,
    notes,
  } = req.body;
  const loginId = req.user._id;
  const existingUser = await userDB.findOne({ loginId });
  if (!existingUser) {
    return res.status(400).json({ message: "User not found" });
  }
  const userId = existingUser._id;
  if (
    !trainerId ||
    !userId ||
    !sessionDate ||
    !startTime ||
    !endTime ||
    !cost
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  const newSession = await PersonalSession.create({
    trainerId,
    userId,
    programId,
    sessionDate,
    startTime,
    endTime,
    mode,
    location,
    cost,
    notes,
  });

  res.status(201).json({
    message: "Personal session created successfully",
    data: newSession,
  });
});
exports.getMySessions = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") return res.status(403).json("Not user");
  const loginId = req.user._id;
  const existingUser = await userDB.findOne({ loginId });
  if (!existingUser) {
    return res.status(400).json({ message: "User not found" });
  }
  const userId = existingUser._id;
  const mySession = await PersonalSession.find({ userId })
    .populate("trainerId", "fullname image")
    .populate("userId", "fullname")
    .populate("programId", "program_name")
    .sort({ createdAt: -1 });
  if (!mySession) {
    return res.status(404).json({ message: "Session not found" });
  }
  res.status(200).json({
    message: "Personal session Retrieved successfully",
    data: mySession,
  });
});
exports.getSessionWithId = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") return res.status(403).json("Not user");
  const id = req.params.id;
  const mySession = await PersonalSession.findById(id)
    .populate("trainerId", "fullname")
    .populate("userId", "fullname")
    .populate("programId", "program_name")
    .sort({ createdAt: -1 });
  if (!mySession) {
    return res.status(404).json({ message: "Session not found" });
  }
  res.status(200).json({
    message: "Personal session Retrieved successfully",
    data: mySession,
  });
});
exports.getTrainerSessions = asyncHandler(async (req, res) => {
  if (req.user.role !== "trainer") return res.status(403).json("Not trainer");
  const loginId = req.user._id;
  const existingTrainer = await trainerDB.findOne({ loginId });
  if (!existingTrainer) {
    return res.status(400).json({ message: "Trainer not found" });
  }
  const trainerId = existingTrainer._id;
  const trainerSession = await PersonalSession.find({ trainerId })
    .populate("trainerId", "fullname")
    .populate("userId", "fullname")
    .populate("programId", "program_name")
    .sort({ createdAt: -1 });
  if (!trainerSession) {
    return res.status(404).json({ message: "Session not found" });
  }
  res.status(200).json({
    message: "Personal session Retrieved successfully",
    data: trainerSession,
  });
});
exports.getBookedSessions = asyncHandler(async (req, res) => {
  if (req.user.role !== "trainer") return res.status(403).json("Not trainer");
  const loginId = req.user._id;
  const existingTrainer = await trainerDB.findOne({ loginId });
  if (!existingTrainer) {
    return res.status(400).json({ message: "Trainer not found" });
  }
  const trainerId = existingTrainer._id;
  const bookedSession = await PersonalSession.find({
    trainerId,
    status: "booked",
  })
    .populate("trainerId", "fullname")
    .populate("userId", "fullname image")
    .populate("programId", "program_name")
    .sort({ createdAt: -1 });
  if (!bookedSession) {
    return res.status(404).json({ message: "Session not found" });
  }
  res.status(200).json({
    message: "Personal session Retrieved successfully",
    data: bookedSession,
  });
});
exports.getTodaySessions = asyncHandler(async (req, res) => {
  if (req.user.role !== "trainer") return res.status(403).json("Not trainer");
  const loginId = req.user._id;
  const existingTrainer = await trainerDB.findOne({ loginId });
  if (!existingTrainer) {
    return res.status(400).json({ message: "Trainer not found" });
  }
  const trainerId = existingTrainer._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const bookedSession = await PersonalSession.find({
    trainerId,
    paymentStatus: "paid",
    sessionDate: { $gte: today, $lt: tomorrow },
  })
    .populate("trainerId", "fullname")
    .populate("userId", "fullname image")
    .populate("programId", "program_name")
    .sort({ startTime: 1 });
  if (!bookedSession) {
    return res.status(404).json({ message: "Session not found" });
  }
  res.status(200).json({
    message: "Personal session Retrieved successfully",
    data: bookedSession,
  });
});
exports.editPersonalSession = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const sessions = await PersonalSession.find({ userId: req.user.id })
    .populate("trainerId")
    .populate("programId")
    .sort({ createdAt: -1 });
  res.json(sessions);
});
exports.changeStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== "trainer") return res.status(403).json("Not trainer");
  console.log("inside");
  console.log(req.body);
  const sessionId = req.params.sessionId;
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Status is required" });
  const updatedSession = await PersonalSession.findByIdAndUpdate(
    sessionId,
    { status },
    { new: true }
  );
  res.json(updatedSession);
});
exports.paymentForSession = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const user = await userDB.findOne({ loginId });
  if (!user) {
    return res.status(401).json({ error: "Complete Profile" });
  }

  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }
  const session = await PersonalSession.findById(sessionId)
    .populate("trainerId", "fullname")
    .populate("userId", "fullname")
    .populate("programId", "program_name");

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  const line_items = [
    {
      price_data: {
        currency: "aed",
        product_data: {
          name: session.programId.program_name,
          description: `Trainer: ${session.trainerId.fullname} |
                      User: ${session.userId.fullname}  |
                      Date: ${session.sessionDate}  |
                      Time: ${session.startTime} - ${session.endTime}`,
          metadata: {
            user_name: session.userId.fullname,
            trainer_name: session.trainerId.fullname,
            session_date: session.sessionDate,
            start_time: session.startTime,
            end_time: session.endTime,
          },
        },
        unit_amount: Math.round(session.cost * 100),
      },
      quantity: 1,
    },
  ];
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL.replace(
      /\/$/,
      ""
    )}/session/success?db_session_id=${sessionId}`,
    cancel_url: `${process.env.FRONTEND_URL.replace(/\/$/, "")}/payment/failed`,
    metadata: {
      user_name: session.userId.fullname,
      trainer_name: session.trainerId.fullname,
    },
  });
  const totalAmount = session.cost;
  const adminShare = totalAmount * 0.3;
  const trainerShare = totalAmount - adminShare;
  await OrderDB.create({
    user: user._id,
    trainer: session.trainerId._id,
    program: session.programId._id,
    order_type: "session",
    totalAmount,
    adminShare,
    trainerShare,
    paymentStatus: "pending",
    stripeSessionId: stripeSession.id,
  });
  res.status(200).json({ success: true, url: stripeSession.url });
});
exports.makePaid = asyncHandler(async (req, res) => {
  const sessionId = req.params.dbSessionId;
  const { status } = req.body;
  const updated = await PersonalSession.findByIdAndUpdate(
    sessionId,
    { paymentStatus: status },
    { new: true }
  );
  res.json({ message: "Status updated successfully", data: updated });
});
