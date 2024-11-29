
const express = require('express');
const paymentApiController = require('../../app/webservice/PaymentApiController');
const { AuthCheck } = require('../../app/middleware/authHelper');
const paymentRouter = express.Router();



paymentRouter.post("/api/checkout", paymentApiController.checkout);
paymentRouter.post(
  "/api/paymentVerification",
  paymentApiController.paymentVerification
);

paymentRouter.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);
paymentRouter.get(
  "/api/payments",
  paymentApiController.getAllPayments
);
module.exports = (app) => {
  app.use(paymentRouter);
};

