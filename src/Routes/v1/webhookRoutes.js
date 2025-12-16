const express = require("express");
const webhookRouter = require("express").Router();
const { stripeWebhook } = require("../../Controllers/paymentController");
webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
module.exports = webhookRouter;
