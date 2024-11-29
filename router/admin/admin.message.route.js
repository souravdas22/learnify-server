const express = require("express");
const adminMesssageWebController = require("../../app/module/admin/message/controller/MessageWebController");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");

const adminMessageRouter = express.Router();

adminMessageRouter.get(
  "/admin/contact",
  adminAuthCheck,
  verifyAdminRole,
  adminMesssageWebController.list
);
module.exports = (app) => {
  app.use(adminMessageRouter);
};
