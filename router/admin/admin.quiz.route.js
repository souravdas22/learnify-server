const express = require("express");
const adminQuizWebController = require("../../app/module/admin/quiz/controller/QuizWebController");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");

const adminQuizRouter = express.Router();

adminQuizRouter.get(
  "/admin/quizzes",
  adminAuthCheck,
  verifyAdminRole,
  adminQuizWebController.list
);
adminQuizRouter.get(
  "/admin/quiz/create/:lessonId",
  adminAuthCheck,
  verifyAdminRole,
  adminQuizWebController.add
);
adminQuizRouter.get(
  "/admin/quiz/active-courses",
  adminAuthCheck,
  verifyAdminRole,
  adminQuizWebController.activeCourse
);
adminQuizRouter.get(
  "/admin/lesson/:lessonId/quizzes",
  adminAuthCheck,
  verifyAdminRole,
  adminQuizWebController.lessonQuizzes
);

// edit 
adminQuizRouter.get(
  "/admin/quiz/edit/:quizId",
  adminAuthCheck,
  verifyAdminRole,
  adminQuizWebController.edit
);
adminQuizRouter.post(
  "/admin/quiz/update/:quizId",
  adminAuthCheck,
  verifyAdminRole,
  adminQuizWebController.updateQuiz
);

adminQuizRouter.delete(
  "/admin/quizzes/:quizId",
  adminAuthCheck,
  verifyAdminRole,
  adminQuizWebController.deleteQuiz
);

// Route to delete a specific question within a quiz by quiz ID and question index
adminQuizRouter.delete(
  "/admin/quizzes/:quizId/question/:questionIndex",
  adminAuthCheck,
  verifyAdminRole,
  adminQuizWebController.deleteQuestion
);


module.exports = (app) => {
  app.use(adminQuizRouter);
};
