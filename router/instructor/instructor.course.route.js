const express = require("express");
const uploadVideo = require("../../app/helper/courseVideoUpload");
const uploadThumbnail = require("../../app/helper/thumbnailUpload");
const instructorCourseWEbController = require("../../app/module/instructor/course/controller/CourseWebController");
const instructorVideoWebController = require("../../app/module/instructor/video/controller/VideoWebController");
const { instructorAuthCheck, verifyInstructorRole } = require("../../app/middleware/authHelper");

const instructorCourseRouter = express.Router();

instructorCourseRouter.get(
  "/instructor/courses",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorCourseWEbController.list
);

instructorCourseRouter.get(
  "/instructor/course/create",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorCourseWEbController.addCourse
);
instructorCourseRouter.get(
  "/instructor/course/update/:id",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorCourseWEbController.updateCourse
);
// create course 
instructorCourseRouter.post(
  "/instructor/course/create",
  uploadThumbnail.single("thumbnail"),
  instructorAuthCheck,
  verifyInstructorRole,
  instructorCourseWEbController.createCourse
);
// edit course 
instructorCourseRouter.post(
  "/instructor/course/edit/:id",
  uploadThumbnail.single("thumbnail"),
  instructorAuthCheck,
  verifyInstructorRole,

  instructorCourseWEbController.editCourse
);


// video 

instructorCourseRouter.get(
  "/instructor/course/:id/videos",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorVideoWebController.getVideos
);
instructorCourseRouter.post(
  "/instructor/course/:courseId/video/create",
  uploadVideo.single("url"),
  instructorAuthCheck,
  verifyInstructorRole,
  instructorVideoWebController.createVideo
);

module.exports = (app) => {
  app.use(instructorCourseRouter);
};
