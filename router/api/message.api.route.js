const express = require("express");
const messageApiController = require("../../app/webservice/MessageApiController");
const { AuthCheck } = require("../../app/middleware/authHelper");

const messageRouter = express.Router();

// Student sends a message (query to instructor)
messageRouter.post("/api/message", AuthCheck, messageApiController.sendMessage);

// List messages (both student and instructor can list their respective messages)
messageRouter.get(
  "/api/messages",
  AuthCheck,
  messageApiController.listMessages
);

// Instructor responds to a message
messageRouter.put(
  "/api/message/:id",
  AuthCheck,
  messageApiController.respondToMessage
);

module.exports = (app) => {
  app.use(messageRouter);
};
