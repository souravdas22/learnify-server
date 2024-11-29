const express = require("express");
const instructorAuthWebController = require("../../app/module/instructor/auth/controller/InstuructorAuthWebController");
const uploadUserImage = require("../../app/helper/userImageUpload");
const { instructorAuthCheck, verifyInstructorRole } = require("../../app/middleware/authHelper");

const instructorAuthRouter = express.Router();

instructorAuthRouter.get("/", instructorAuthWebController.login);
instructorAuthRouter.get("/instructor/dashboard",instructorAuthCheck,verifyInstructorRole, instructorAuthWebController.dashboard);
instructorAuthRouter.get(
  "/instructor/details",
  instructorAuthCheck,verifyInstructorRole,
  instructorAuthWebController.userDetails
);
instructorAuthRouter.get(
  "/instructor/update-password",
  instructorAuthCheck,
  verifyInstructorRole,
  instructorAuthWebController.viewupdatepassword
);
instructorAuthRouter.get("/instructor/register", instructorAuthWebController.register);
instructorAuthRouter.post(
  "/instructor/register",
  uploadUserImage.single("profilePicture"),
  instructorAuthWebController.registerUser
);
instructorAuthRouter.get(
  "/confirmation/:email/:token",
  instructorAuthWebController.confirmation
);
instructorAuthRouter.get("/instructor/logout",  instructorAuthCheck,verifyInstructorRole,
  instructorAuthWebController.logout);
 
  instructorAuthRouter.post(
    "/instructor/update-password",
    instructorAuthCheck,
    verifyInstructorRole,
    instructorAuthWebController.updatePassword
  );

module.exports = (app) => {
  app.use(instructorAuthRouter);
};
