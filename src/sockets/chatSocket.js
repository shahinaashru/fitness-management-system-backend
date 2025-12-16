const ChatMessage = require("../Models/chatMessageModel");
const connectedUsers = {};
const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("register", ({ userId, trainerId }) => {
      connectedUsers[userId] = socket.id;
      connectedUsers[trainerId] = socket.id;

      console.log("Registered:", userId, trainerId, socket.id);
    });
    socket.on("send_message", async (data) => {
      const { sender, receiver, message } = data;
      if (!sender || !receiver || !message) return;
      const newMessage = new ChatMessage({ sender, receiver, message });
      await newMessage.save();
      const receiverSocket = connectedUsers[receiver];
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", newMessage);
      }
      socket.emit("receive_message", newMessage);
    });
    socket.on("get_chat_history", async ({ userId, trainerId }) => {
      try {
        const messages = await ChatMessage.find({
          $or: [
            { sender: userId, receiver: trainerId },
            { sender: trainerId, receiver: userId },
          ],
        }).sort({ timestamp: 1 });

        socket.emit("chat_history", messages);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    });
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
