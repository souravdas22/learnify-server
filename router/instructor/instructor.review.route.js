const express = require("express");
const instructorReviewWebController = require("../../app/module/instructor/review/controller/ReviewWebController");
const { instructorAuthCheck, verifyInstructorRole } = require("../../app/middleware/authHelper");
const instructorReviewRouter = express.Router();

instructorReviewRouter.get(
  "/instructor/reviews",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorReviewWebController.getInstructorReviews
);
module.exports = (app) => {
  app.use(instructorReviewRouter);
};
