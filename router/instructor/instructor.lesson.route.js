const express = require("express");
const instructorLessonWebController = require("../../app/module/instructor/lesson/controller/LessonWebController");
const { instructorAuthCheck, verifyInstructorRole } = require("../../app/middleware/authHelper");


const instructorCourseRouter = express.Router();

instructorCourseRouter.get(
  "/instructor/course/lessons",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorLessonWebController.list
);

instructorCourseRouter.get(
  "/instructor/course/:courseId/lesson/create",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorLessonWebController.addLesson
);
instructorCourseRouter.get(
  "/instructor/course/:courseId/lessons",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorLessonWebController.courseLessons
);
instructorCourseRouter.get(
  "/instructor/lesson/active-courses",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorLessonWebController.activeCourse
);

module.exports = (app) => {
  app.use(instructorCourseRouter);
};
