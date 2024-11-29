const express = require("express");
const userApiController = require("../../app/webservice/UserApiController");
const uploadUserImage = require("../../app/helper/userImageUpload");
const { AuthCheck } = require("../../app/middleware/authHelper");

const UserRouter = express.Router();

UserRouter.post(
  "/api/register",
  uploadUserImage.single("profilePicture"),
  userApiController.register
);
UserRouter.post("/api/login",  userApiController.login);
UserRouter.get(
  "/api/confirmation/:email/:token",
  userApiController.confirmation
);
UserRouter.get("/api/user/:id",AuthCheck, userApiController.userDetails);
UserRouter.get(
  "/api/instructor/:id",
  AuthCheck,
  userApiController.instructorDetails
);
UserRouter.post(
  "/api/user/update-password/:id",
  AuthCheck,
  userApiController.updatePassword
);
UserRouter.post(
  "/user/edit/:id",
  uploadUserImage.single("profilePicture"),
  AuthCheck,
  userApiController.editUser
);
  UserRouter.get("/api/users/:role", AuthCheck, userApiController.usersbyRole);

UserRouter.post(
  "/api/user/create",
  uploadUserImage.single("profilePicture"),
  userApiController.createUser
);
UserRouter.post(
  "/api/user/edit/:id",
  uploadUserImage.single("profilePicture"),
  AuthCheck,
  userApiController.updateUser
);
UserRouter.get("/api/instructors", AuthCheck, userApiController.getInstructors);

UserRouter.get(
  "/api/user/enrolled-courses/:id",
  AuthCheck,

  userApiController.getEnrolledCourss
);
UserRouter.post(
  "/api/instructor-details/update/:id",
  AuthCheck,

  userApiController.updateInstructorDetails
);

// forgot password

// forget password
UserRouter.post(
  "/api/forget-password",
  userApiController.forgetPassword
);
// password reset confirmation
UserRouter.get(
  "/api/password-reset/confirmation/:email/:token",

  userApiController.passwordresetconfirmation
);
//new password
UserRouter.post(
  "/api/new-password/:email",
  userApiController.newPasswordReset
);

module.exports = (app) => {
  app.use(UserRouter);
};