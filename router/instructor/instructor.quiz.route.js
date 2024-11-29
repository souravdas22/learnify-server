const express = require("express");
const instructorQuizWebController = require("../../app/module/instructor/quiz/controller/QuizWebController");
const { instructorAuthCheck, verifyInstructorRole } = require("../../app/middleware/authHelper");

const instructorQuizRouter = express.Router();

instructorQuizRouter.get(
  "/instructor/quizzes",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorQuizWebController.list
);
instructorQuizRouter.get(
  "/instructor/quiz/create/:lessonId",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorQuizWebController.add
);
instructorQuizRouter.get(
  "/instructor/quiz/active-courses",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorQuizWebController.activeCourse
);
instructorQuizRouter.get(
  "/instructor/lesson/:lessonId/quizzes",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorQuizWebController.lessonQuizzes
);

// edit
instructorQuizRouter.get(
  "/instructor/quiz/edit/:quizId",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorQuizWebController.edit
);
instructorQuizRouter.post(
  "/instructor/quiz/update/:quizId",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorQuizWebController.updateQuiz
);

instructorQuizRouter.delete(
  "/instructor/quizzes/:quizId",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorQuizWebController.deleteQuiz
);

instructorQuizRouter.delete(
  "/instructor/quizzes/:quizId/question/:questionIndex",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorQuizWebController.deleteQuestion
);

module.exports = (app) => {
  app.use(instructorQuizRouter);
};
