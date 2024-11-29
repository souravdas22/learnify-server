const express = require("express");
const reviewApiController = require("../../app/webservice/ReviewApiController");
const { AuthCheck } = require("../../app/middleware/authHelper");
const reviewRouter = express.Router();

reviewRouter.post(
  "/api/review/create",
  AuthCheck,
  reviewApiController.createReview
); 
reviewRouter.get(
  "/api/reviews/:courseId",
  AuthCheck,
 reviewApiController.getReviewsByCourse
);
reviewRouter.get(
  "/api/reviews/average/:courseId",
  AuthCheck,
  reviewApiController.getAvgRating
);


module.exports = (app) => {
  app.use(reviewRouter);
};

