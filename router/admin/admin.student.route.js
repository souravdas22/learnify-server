const express = require("express");
const studentWebController = require("../../app/module/admin/student/controller/StudentWebController");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");
const adminStudentsRouter = express.Router();

adminStudentsRouter.get(
  "/admin/students",
  adminAuthCheck,
  verifyAdminRole,
  studentWebController.list
);
adminStudentsRouter.get(
  "/admin/student/add",
  adminAuthCheck,
  verifyAdminRole,
  studentWebController.add
);
adminStudentsRouter.get(
  "/admin/student/edit/:id",
  adminAuthCheck,
  verifyAdminRole,
  studentWebController.edit
);

module.exports = (app) => {
  app.use(adminStudentsRouter);
};
