const express = require("express");
const authMiddleware = require("../../Middlewares/authMiddleware");
const personalSessionRouter = express.Router();
const {
  addPersonalSession,
  editPersonalSession,
  getMySessions,
  getTrainerSessions,
  changeStatus,
  paymentForSession,
  makePaid,
  getSessionWithId,
  getBookedSessions,
  getTodaySessions,
} = require("../../Controllers/personalSessionController");
personalSessionRouter.post("/", authMiddleware, addPersonalSession);
personalSessionRouter.put("/:id", authMiddleware, editPersonalSession);
personalSessionRouter.get("/my", authMiddleware, getMySessions);
personalSessionRouter.get("/session/:id", authMiddleware, getSessionWithId);
personalSessionRouter.get(
  "/trainer-session",
  authMiddleware,
  getTrainerSessions
);
personalSessionRouter.get(
  "/booked-sessions",
  authMiddleware,
  getBookedSessions
);
personalSessionRouter.get("/today-sessions", authMiddleware, getTodaySessions);
personalSessionRouter.put("/status/:sessionId", authMiddleware, changeStatus);
personalSessionRouter.put("/make-paid/:dbSessionId", authMiddleware, makePaid);
personalSessionRouter.post(
  "/session-payment",
  authMiddleware,
  paymentForSession
);
module.exports = personalSessionRouter;
