const express = require("express");
const adminCategoryWebController = require("../../app/module/admin/category/controller/CategoryWebController");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");
const adminCategoryRouter = express.Router();

adminCategoryRouter.get(
  "/admin/categories",
  adminAuthCheck,
  verifyAdminRole,
  adminCategoryWebController.list
);
adminCategoryRouter.get(
  "/admin/category/:id/toggle-status",
  adminAuthCheck,
  verifyAdminRole,
  adminCategoryWebController.toggleCategoryStatus
);

module.exports = (app) => {
  app.use(adminCategoryRouter);
};
