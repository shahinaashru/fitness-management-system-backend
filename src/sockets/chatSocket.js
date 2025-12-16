const ChatMessage = require("../Models/chatMessageModel");

const connectedUsers = {}; // userId/trainerId -> socketId

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register user/trainer (support both user and trainer)
    socket.on("register", ({ userId, trainerId }) => {
      // Store both userId and trainerId in the connectedUsers
      connectedUsers[userId] = socket.id;
      connectedUsers[trainerId] = socket.id;

      console.log("Registered:", userId, trainerId, socket.id);
    });

    // Send message handler
    socket.on("send_message", async (data) => {
      const { sender, receiver, message } = data;
      if (!sender || !receiver || !message) return;

      // Save message to the database
      const newMessage = new ChatMessage({ sender, receiver, message });
      await newMessage.save();

      // Emit to receiver (the person who is receiving the message)
      const receiverSocket = connectedUsers[receiver];
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", newMessage);
      }

      // Emit to sender (optional, for immediate update on the sender's screen)
      socket.emit("receive_message", newMessage);
    });

    // Get chat history for the given user/trainer
    socket.on("get_chat_history", async ({ userId, trainerId }) => {
      try {
        const messages = await ChatMessage.find({
          $or: [
            { sender: userId, receiver: trainerId },
            { sender: trainerId, receiver: userId },
          ],
        }).sort({ timestamp: 1 });

        socket.emit("chat_history", messages); // Send back the chat history to the user
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const key in connectedUsers) {
        if (connectedUsers[key] === socket.id) {
          delete connectedUsers[key];
          break;
        }
      }
    });
  });
};

module.exports = chatSocket;
