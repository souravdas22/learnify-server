const express = require("express");
const adminCourseWebController = require("../../app/module/admin/course/controller/CourseWebController");
const adminVideoWebController = require("../../app/module/admin/video/controller/VideoWebController");
const uploadVideo = require("../../app/helper/courseVideoUpload");
const uploadThumbnail = require("../../app/helper/thumbnailUpload");
const { verifyAdminRole, adminAuthCheck } = require("../../app/middleware/authHelper");

const adminCourseRouter = express.Router();

adminCourseRouter.get("/admin/courses",adminAuthCheck,verifyAdminRole, adminCourseWebController.list);

adminCourseRouter.get(
  "/admin/course/create",adminAuthCheck,verifyAdminRole,
  adminCourseWebController.addCourse
);
adminCourseRouter.get(
  "/admin/course/update/:id",adminAuthCheck,verifyAdminRole,
  adminCourseWebController.updateCourse
);
adminCourseRouter.get(
  "/admin/course/delete/:id",
  adminAuthCheck,
  verifyAdminRole,
  adminCourseWebController.deleteCourse
);
// create course 
adminCourseRouter.post(
  "/admin/course/create",adminAuthCheck,verifyAdminRole,
  uploadThumbnail.single("thumbnail"),
  // authenticateRole(['instructor,admin'],'create-course'),
  adminCourseWebController.createCourse
);
// edit course 
adminCourseRouter.post(
  "/admin/course/edit/:id",adminAuthCheck,verifyAdminRole,
  uploadThumbnail.single("thumbnail"),
  // authenticateRole(['instructor,admin'],'create-course'),
  adminCourseWebController.editCourse
);

adminCourseRouter.get(
  "/admin/course/:id/active",adminAuthCheck,verifyAdminRole,
  adminCourseWebController.ActivateCourse
);
adminCourseRouter.get(
  "/admin/course/:id/deactive",adminAuthCheck,verifyAdminRole,
  adminCourseWebController.deactiveCourse
);


// video 

adminCourseRouter.get(
  "/admin/course/:id/videos",adminAuthCheck,verifyAdminRole,
  adminVideoWebController.getVideos
);
adminCourseRouter.post(
  "/admin/course/:courseId/video/create",
  uploadVideo.single("url"),adminAuthCheck,verifyAdminRole,
  adminVideoWebController.createVideo
);

module.exports = (app) => {
  app.use(adminCourseRouter);
};
