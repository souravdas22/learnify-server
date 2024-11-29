const express = require("express");
const roleApiController = require("../../app/webservice/RoleApiController");

const roleRouter = express.Router();

roleRouter.post("/api/role/create", roleApiController.createRole);
// quizRouter.get("/api/quizzes/:id", quizApiController.listQuizzes);


module.exports = (app) => {
  app.use(roleRouter);
};
