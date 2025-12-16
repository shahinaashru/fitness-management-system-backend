const express = require("express");
const ChatMessage = require("../../Models/chatMessageModel");

const router = express.Router();

// GET chat history
router.get("/:userId/:trainerId", async (req, res) => {
  try {
    const { userId, trainerId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { sender: userId, receiver: trainerId },
        { sender: trainerId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
