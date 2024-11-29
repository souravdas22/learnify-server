const express = require("express");
const adminPaymentWebController = require("../../app/module/admin/payment/controller/PaymentWebController");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");
const adminTicketssRouter = express.Router();

adminTicketssRouter.get(
  "/admin/payments",
  adminAuthCheck,
  verifyAdminRole,
  adminPaymentWebController.list
);


module.exports = (app) => {
  app.use(adminTicketssRouter);
};
