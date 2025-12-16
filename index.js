const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const port = process.env.PORT;
const app = express();
const server = http.createServer(app);
const apiRouter = require("./src/Routes");
const webhookRouter = require("./src/Routes/v1/webhookRoutes");
const chatSocket = require("./src/sockets/chatSocket");
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.options(
  "/*",
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/api/v1/stripe", webhookRouter);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));
app.use(express.json());
app.use("/api", apiRouter);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL },
  methods: ["GET", "POST"],
  credentials: true,
});
chatSocket(io);
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
