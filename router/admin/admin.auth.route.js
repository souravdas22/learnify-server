const express = require("express");
const adminAuthWebController = require("../../app/module/admin/auth/controller/AdminAuthWebController");
const uploadUserImage = require("../../app/helper/userImageUpload");
const { adminAuthCheck, verifyAdminRole } = require("../../app/middleware/authHelper");

const adminAuthRouter = express.Router();

adminAuthRouter.get("/", adminAuthWebController.login);
adminAuthRouter.get("/admin/dashboard",adminAuthCheck,verifyAdminRole, adminAuthWebController.dashboard);
adminAuthRouter.get(
  "/admin/details",
  adminAuthCheck,
  verifyAdminRole,
  adminAuthWebController.userDetails
);
adminAuthRouter.get(
  "/admin/register",
  adminAuthWebController.register
);
adminAuthRouter.get(
  "/admin/forget-password",
  adminAuthWebController.viewforgetpassword
);
adminAuthRouter.get(
  "/admin/update-password",
  adminAuthCheck,
  verifyAdminRole,
  adminAuthWebController.viewupdatepassword
);

adminAuthRouter.post(
  "/admin/register",
  uploadUserImage.single("profilePicture"),
  adminAuthWebController.registerUser
);
adminAuthRouter.get(
  "/confirmation/:email/:token",
  adminAuthWebController.confirmation
);
adminAuthRouter.post(
  "/login",
  adminAuthWebController.loginUser
);
adminAuthRouter.get(
  "/admin/logout",
  adminAuthWebController.logout
);

adminAuthRouter.post(
  "/admin/forget-password",
  adminAuthWebController.forgetPassword
);
// password reset confirmation
adminAuthRouter.get(
  "/admin/password-reset/confirmation/:email/:token",
  adminAuthWebController.passwordresetconfirmation
);
//update password
adminAuthRouter.post(
  "/admin/update-password",
  adminAuthCheck,
  verifyAdminRole,
  adminAuthWebController.updatePassword
);

module.exports = (app) => {
  app.use(adminAuthRouter);
};
