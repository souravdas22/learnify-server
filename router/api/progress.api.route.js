const express = require("express");
const progressApiController = require("../../app/webservice/ProgressApiController");
const { AuthCheck } = require("../../app/middleware/authHelper");
const progressRouter = express.Router();

progressRouter.get(
  "/api/progress/:userId/:courseId",
  AuthCheck,
  progressApiController.getCourseProgress
);
progressRouter.post(
  "/api/progress/mark-video-completed",
  AuthCheck,
  progressApiController.markVideoCompleted
);
progressRouter.post(
  "/api/progress/updateQuizScore",
  AuthCheck,
  progressApiController.updateQuizScore
);


module.exports = (app) => {
  app.use(progressRouter);
};
