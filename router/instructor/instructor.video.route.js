const express = require("express");
const uploadVideo = require("../../app/helper/courseVideoUpload");
const instructorVideoWebController = require("../../app/module/instructor/video/controller/VideoWebController");
const { instructorAuthCheck, verifyInstructorRole } = require("../../app/middleware/authHelper");

const instructorVideoRouter = express.Router();

// video
instructorVideoRouter.get(
  "/instructor/course/lesson/:lessonId/videos",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorVideoWebController.getVideos
);
instructorVideoRouter.post(
  "/instructor/course/:lessonId/video/create",
  uploadVideo.single("url"),
  instructorAuthCheck,
  verifyInstructorRole,
  instructorVideoWebController.createVideo
);

module.exports = (app) => {
  app.use(instructorVideoRouter);
};
