const Stripe = require("stripe");
const OrderDB = require("../Models/orderModel");
const userDB = require("../Models/userModel");
const trainerDB = require("../Models/trainerModel");
const asyncHandler = require("../Middlewares/asyncHandler");
const stripe = new Stripe(process.env.SECRET_STRIPE);
const getMyOrder = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const userData = await userDB.findOne({ loginId });
  if (!userData) {
    return res.status(401).json({ error: "No User Found" });
  }
  const user = userData._id;
  const order = await OrderDB.find({ user }).populate("program");
  return res.status(200).json({
    message: "Order details retrieved successfully",
    Order: order,
  });
});
const getTrinerOrders = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const trainerData = await trainerDB.findOne({ loginId });
  if (!trainerData) {
    return res.status(401).json({ error: "No User Found" });
  }
  const trainer = trainerData._id;
  const order = await OrderDB.find({ trainer })
    .populate("program")
    .populate("user", "fullname email");
  return res.status(200).json({
    message: "Order details retrieved successfully",
    Order: order,
  });
});
const paymentFunction = asyncHandler(async (req, res) => {
  const loginId = req.user._id;
  const user = await userDB.findOne({ loginId });
  if (!user) {
    return res.status(401).json({ error: "Complete Profile" });
  }
  const program = req.body.fitnessProgram;
  if (!program) return res.status(400).json({ error: "No program selected" });

  const line_items = [
    {
      price_data: {
        currency: "aed",
        product_data: {
          name: program.program_name,
          images: program.image ? [program.image] : [],
        },
        unit_amount: Math.round(program.cost * 100),
      },
      quantity: 1,
    },
  ];
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: line_items,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}payment/success?program_id=${program._id}`,
    cancel_url: `${process.env.FRONTEND_URL}payment/failed`,
    metadata: {
      userId: user._id.toString(),
      programId: program._id.toString(),
      trainerId: program.trainer.toString(),
    },
  });
  const totalAmount = program.cost;
  const adminShare = totalAmount * 0.3;
  const trainerShare = totalAmount - adminShare;
  await OrderDB.create({
    user: user._id,
    trainer: program.trainer,
    program: program._id,
    order_type: "program",
    totalAmount,
    adminShare,
    trainerShare,
    paymentStatus: "pending",
    stripeSessionId: session.id,
  });
  res.status(200).json({ success: true, url: session.url });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId;
  const { status } = req.body;
  const order = await OrderDB.findOne({ sessionId });
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (status === "success") {
    order.paymentStatus = "success";
  } else {
    order.paymentStatus = "failed";
  }

  await order.save();

  return res.status(200).json({ message: "Order status updated", order });
});
const stripeWebhook = async (req, res) => {
  console.log("inside webhook");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Webhook received:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log(session.id);
      const { userId, programId, trainerId } = session.metadata;

      const order = await OrderDB.findOne({
        stripeSessionId: session.id,
      });

      if (order) {
        order.paymentStatus = "success";
        await order.save();
        console.log(`Order ${order._id} marked as successful.`);
      } else {
        console.error(`Order not found for session ID: ${session.id}`);
      }
      break;

    case "payment_intent.payment_failed":
      const failedSession = event.data.object;
      const failedOrder = await OrderDB.findOne({
        stripeSessionId: failedSession.id,
      });

      if (failedOrder) {
        failedOrder.paymentStatus = "failed";
        await failedOrder.save();
        console.log(`Order ${failedOrder._id} marked as failed.`);
      } else {
        console.error(
          `Failed order not found for session ID: ${failedSession.id}`
        );
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
module.exports = {
  paymentFunction,
  updateOrderStatus,
  stripeWebhook,
  getMyOrder,
  getTrinerOrders,
};
