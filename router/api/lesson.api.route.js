const express = require("express");
const LessonApiController = require("../../app/webservice/LessonApiController");
const { AuthCheck } = require("../../app/middleware/authHelper");

const lessonRouter = express.Router();

// Route to create a new lesson for a specific course, with material upload
lessonRouter.post(
  "/api/course/:courseId/lesson/create",
  AuthCheck,

  LessonApiController.createLesson
);

// Route to fetch all lessons
lessonRouter.get("/api/lessons", AuthCheck, LessonApiController.getLessons);

// Route to fetch lessons for a specific course
lessonRouter.get(
  "/api/course/:courseId/lessons",
  AuthCheck,

  LessonApiController.getLessons
);

// Route to mark a specific lesson as completed
lessonRouter.post(
  "/api/course/:courseId/lessons/:lessonId/complete",
  AuthCheck,

  LessonApiController.markLessonComplete
);

module.exports = (app) => {
  app.use(lessonRouter);
};
