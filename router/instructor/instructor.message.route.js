const express = require("express");
const instructorMesssageWebController = require("../../app/module/instructor/message/controller/MessageWebController");
const { instructorAuthCheck, verifyInstructorRole } = require("../../app/middleware/authHelper");

const instructorMessageRouter = express.Router();

instructorMessageRouter.get(
  "/instructor/messages",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorMesssageWebController.list
);
module.exports = (app) => {
  app.use(instructorMessageRouter);
};
