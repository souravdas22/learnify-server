const express = require('express');
const instructorWebController = require('../../app/module/admin/instructor/controller/InstructorWebController');
const { adminAuthCheck, verifyAdminRole } = require('../../app/middleware/authHelper');
const adminInstructorsRouter = express.Router();



adminInstructorsRouter.get(
  "/admin/instructors",
  adminAuthCheck,
  verifyAdminRole,
  instructorWebController.list
);
adminInstructorsRouter.get(
  "/admin/instructor/add",
  adminAuthCheck,
  verifyAdminRole,
  instructorWebController.add
);
adminInstructorsRouter.get(
  "/admin/instructor/edit/:id",
  adminAuthCheck,
  verifyAdminRole,
  instructorWebController.edit
);

module.exports = (app) => {
  app.use(adminInstructorsRouter);
};

