const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
 },
  razorpay_payment_id: {
    type: String,
  },
  razorpay_signature: {
    type: String,
  },
  amount: Number,
  courseIds: [mongoose.Schema.Types.ObjectId],
  userId: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: "Pending" },
},{timestamps:true,versionKey:false});

const PaymentModel = mongoose.model("Payment", paymentSchema);

module.exports = PaymentModel;
