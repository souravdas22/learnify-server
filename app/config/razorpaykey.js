const Razorpay =require('razorpay')


export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RZORPAY_API_SECRECT,
  });