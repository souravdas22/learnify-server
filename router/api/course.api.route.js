const express = require("express");
const courseApiController = require("../../app/webservice/CourseApiController");
const uploadThumbnail = require("../../app/helper/thumbnailUpload");
const { AuthCheck } = require("../../app/middleware/authHelper");

const courseRouter = express.Router();

// Route to create a new course, with thumbnail upload
courseRouter.post(
  "/api/course/create",
  AuthCheck,
  uploadThumbnail.single("thumbnail"),
  courseApiController.createCourse
);

// Route to fetch only active courses
courseRouter.get("/api/courses", AuthCheck, courseApiController.getCourses);

// Route to fetch all courses
courseRouter.get(
  "/api/admin/courses",
  AuthCheck,
  courseApiController.getCoursesForAdmin
);

courseRouter.get(
  "/api/instructor/:id/courses",
  AuthCheck,
  courseApiController.getCoursesForInstructors
);

// Route to fetch details of a specific course
courseRouter.get(
  "/api/course/:id",
  AuthCheck,
  courseApiController.courseDetails
);

// Route to enroll a user in a specific course
courseRouter.post(
  "/api/course/:courseId/enroll",
  AuthCheck,

  courseApiController.enrolledInCourse
);

// Route to mark a specific video in a course as complete
courseRouter.post(
  "/api/course/:courseId/videos/:videoId/complete",
  AuthCheck,

  courseApiController.videosCompleted
);

courseRouter.get(
  "/api/course/filter/category",
  AuthCheck,

  courseApiController.filterByCategory
);
courseRouter.get(
  "/api/course/filter/instructor",
  AuthCheck,

  courseApiController.filterByInstructor
);
courseRouter.get(
  "/api/search/courses",
  AuthCheck,
  courseApiController.searchCourses
);

module.exports = (app) => {
  app.use(courseRouter);
};
