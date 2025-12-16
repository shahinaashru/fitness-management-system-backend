const express = require("express");
const fitnessProgramRouter = express.Router();
const {
  createFitnessProgram,
  updateFitnessProgram,
  listFitnessPrograms,
  listFitnessProgram,
  getMyFitnessPrograms,
} = require("../../Controllers/fitnessProgramController");
const upload = require("../../Middlewares/multer");
const authMiddleware = require("../../Middlewares/authMiddleware");
const {
  assignFitnessProgram,
  programStatusChange,
  updateProgramAssignment,
  getProgramAssignment,
} = require("../../Controllers/programAssignmentController");
fitnessProgramRouter.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createFitnessProgram
);
fitnessProgramRouter.get("/", authMiddleware, listFitnessPrograms);
fitnessProgramRouter.get("/my-program", authMiddleware, getMyFitnessPrograms);
fitnessProgramRouter.get("/:id", authMiddleware, listFitnessProgram);
fitnessProgramRouter.post(
  "/assign-program",
  authMiddleware,
  assignFitnessProgram
);
fitnessProgramRouter.put("/:id", authMiddleware, updateFitnessProgram);
fitnessProgramRouter.put(
  "/assign-program/:id",
  authMiddleware,
  updateProgramAssignment
);
fitnessProgramRouter.post(
  "/activate-program",
  authMiddleware,
  programStatusChange
);
fitnessProgramRouter.get(
  "/assign-program",
  authMiddleware,
  getProgramAssignment
);
module.exports = fitnessProgramRouter;
