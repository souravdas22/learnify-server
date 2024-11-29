const express = require("express");
const adminLessonWebController = require("../../app/module/admin/lesson/controller/LessonWebController");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");


const adminCourseRouter = express.Router();

adminCourseRouter.get(
  "/admin/course/lessons",
  adminAuthCheck,
  verifyAdminRole,
  adminLessonWebController.list
);

adminCourseRouter.get(
  "/admin/course/:courseId/lesson/create",
  adminAuthCheck,
  verifyAdminRole,
  adminLessonWebController.addLesson
);
adminCourseRouter.get(
  "/admin/course/:courseId/lessons",
  adminAuthCheck,
  verifyAdminRole,
  adminLessonWebController.courseLessons
);
adminCourseRouter.get(
  "/admin/lesson/active-courses",
  adminAuthCheck,
  verifyAdminRole,
  adminLessonWebController.activeCourse
);

module.exports = (app) => {
  app.use(adminCourseRouter);
};
