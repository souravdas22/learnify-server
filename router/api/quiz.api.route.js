const express = require("express");
const quizApiController = require("../../app/webservice/QuizApiController");
const { AuthCheck } = require("../../app/middleware/authHelper");

const quizRouter = express.Router();

quizRouter.post("/api/quiz/create", AuthCheck, quizApiController.createQuiz);


quizRouter.put("/api/quiz/edit/:id", AuthCheck, quizApiController.updateQuiz); 

quizRouter.delete(
  "/api/quiz/delete/:id",
  AuthCheck,
  quizApiController.deleteQuiz
);

quizRouter.get("/api/quizzes", AuthCheck, quizApiController.getAllQuizzes); 

quizRouter.get("/api/quizzes/:id", AuthCheck, quizApiController.listQuizzes); 


quizRouter.post(
  "/api/quiz/answer/:id",
  AuthCheck,
  quizApiController.answerQuiz
);

quizRouter.get(
  "/api/quiz/result/:userId",
  AuthCheck,
  quizApiController.quizResults
); 

module.exports = (app) => {
  app.use(quizRouter);
};
