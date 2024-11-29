const express = require("express");
const instructorStudentWebController = require("../../app/module/instructor/student/controller/StudentWebController");
const { instructorAuthCheck, verifyInstructorRole } = require("../../app/middleware/authHelper");
const instructorStudentsRouter = express.Router();

instructorStudentsRouter.get(
  "/instructor/students",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorStudentWebController.list
);
instructorStudentsRouter.get(
  "/instructor/student/add",
  instructorAuthCheck,
  verifyInstructorRole,

  instructorStudentWebController.add
);
instructorStudentsRouter.get(
  "/instructor/student/edit/:id",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorStudentWebController.edit
);

module.exports = (app) => {
  app.use(instructorStudentsRouter);
};
