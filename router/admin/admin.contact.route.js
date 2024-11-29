const express = require("express");
const adminContactWebController = require("../../app/module/admin/contact/controller/ContactWebController");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");
const adminTContactRouter = express.Router();

adminTContactRouter.get(
  "/admin/contacts",
  adminAuthCheck,
  verifyAdminRole,
  adminContactWebController.list
);

module.exports = (app) => {
  app.use(adminTContactRouter);
};
