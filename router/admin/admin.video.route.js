const express = require("express");
const adminVideoWebController = require("../../app/module/admin/video/controller/VideoWebController");
const uploadVideo = require("../../app/helper/courseVideoUpload");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");

const adminVideoRouter = express.Router();


adminVideoRouter.get(
  "/admin/course/lesson/:lessonId/videos",
  adminAuthCheck,
  verifyAdminRole,
  adminVideoWebController.getVideos
);
adminVideoRouter.post(
  "/admin/course/lesson/video/create",
  uploadVideo.single("url"),
  adminAuthCheck,
  verifyAdminRole,
  adminVideoWebController.createVideo
);

module.exports = (app) => {
  app.use(adminVideoRouter);
};
