const express = require("express");
const paymentRouter = require("express").Router();
const {
  paymentFunction,
  updateOrderStatus,
  getMyOrder,
  getTrinerOrders,
} = require("../../Controllers/paymentController");
const authMiddleware = require("../../Middlewares/authMiddleware");
const { stripeWebhook } = require("../../Controllers/paymentController");
paymentRouter.get("/my-order", authMiddleware, getMyOrder);
paymentRouter.get("/trainer-order", authMiddleware, getTrinerOrders);
paymentRouter.post("/makepayment", authMiddleware, paymentFunction);
paymentRouter.put("/update-status/:id", authMiddleware, updateOrderStatus);
module.exports = paymentRouter;
