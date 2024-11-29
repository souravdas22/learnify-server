const {
  comparePassword,
  hashPassword,
  createTransporter,
  mailSend,
} = require("../../../../middleware/authHelper");
const RoleModel = require("../../../role/model/role.model");
const TokenModel = require("../model/token.model");
const UserModel = require("../model/user.model");
const crypto = require("crypto");
const userRepository = require("../repository/userRepository");
const jwt = require("jsonwebtoken");
const Joi = require('joi');
const { CourseModel } = require("../../course/model/course.model");
const PaymentModel = require("../../payment/payment.model");

class AdminAuthWebController {
  async dashboard(req, res) {
    try {
      const _id = req.admin._id;
      const user = await UserModel.findOne({ _id });

      const earningData = await PaymentModel.aggregate([
        {
          $group: {
            _id: null,
            totalEarning: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalEarning: 1,
          },
        },
      ]);
      const courseData = await CourseModel.aggregate([
        {
          $group: {
            _id: null,
            totalInstructor: { $addToSet: "$instructor" },
            totalCategory: { $addToSet: "$category" },
            totalCourses: { $sum: 1 },
            totalActiveCourses: {
              $sum: {
                $cond: [{ $eq: ["$status", "published"] }, 1, 0],
              },
            },
            uniqueStudents: { $addToSet: "$students" },
          },
        },
        {
          $project: {
            _id: 0,
            totalCourses: 1,
            totalActiveCourses: 1,
            totalInstructor: { $size: "$totalInstructor" },
            totalCategory: { $size: "$totalCategory" },
            totalStudents: {
              $size: {
                $reduce: {
                  input: "$uniqueStudents",
                  initialValue: [],
                  in: {
                    $setUnion: ["$$value", "$$this"],
                  },
                },
              },
            },
          },
        },
      ]);
      res.render("admin/dashboard/dashboard.ejs", {
        title: "Admin Dashboard",
        user: user,
        courseData: courseData[0],
        earningData: earningData[0],
      });
    } catch (err) {
      console.log(err);
    }
  }
  async userDetails(req, res) {
    try {
      const _id = req.admin._id;
      const user = await UserModel.findOne({ _id });
      res.render("admin/dashboard/profile.ejs", {
        title: "Admin Profile",
        id: _id,
        user: user,
      });
    } catch (err) {
      console.log(err);
    }
  }
  async login(req, res) {
    try {
      res.render("admin/dashboard/login.ejs", {
        title: " login",
      });
    } catch (err) {
      console.log(err);
    }
  }
  async register(req, res) {
    try {
      res.render("admin/dashboard/register.ejs", {
        title: "Admin register",
      });
    } catch (err) {
      console.log(err);
    }
  }
  async viewforgetpassword(req, res) {
    try {
      res.render("admin/password/forget-password.ejs", {
        title: "Admin forget password",
      });
    } catch (err) {
      console.log(err);
    }
  }

  async viewnewpassword(req, res) {
    try {
      res.render("admin/password/new-password.ejs", {
        title: "Admin new password",
      });
    } catch (err) {
      console.log(err);
    }
  }
  async viewupdatepassword(req, res) {
    try {
      const _id = req.admin._id;
      const user = await UserModel.findOne({ _id });
      res.render("admin/password/update-password.ejs", {
        title: "Admin update password",
        user
      });
    } catch (err) {
      console.log(err);
    }
  }

  async forgetPassword(req, res) {
    try {
      const { email } = req.body;
      //check user
      const user = await userRepository.findUser({ email });
      if (!user) {
        console.log("Email is not registered");
      }
      if (user.isVerified === false) {
        console.log("email is not verified");
      }
      const token_model = new TokenModel({
        _userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      });
      await token_model.save();

      const senderEmail = process.env.MAIL_ID;
      const senderPassword = process.env.PASSWORD;
      const transport = createTransporter(senderEmail, senderPassword);
      const mailOptions = {
        from: senderEmail,
        to: user.email,
        subject: "Forgot Password",
        html: `
        <p>create a new password by clicking the link below:</p>
         <a href="http://${req.headers.host}/admin/password-reset/confirmation/${user.email}/${token_model.token}">
        Reset Password
        </a>
        <p>Thank you!</p>
         `,
      };
      if (user.isVerified) {
        mailSend(req, res, transport, mailOptions);
      }

      console.log("password reset link sent successfully on your email");
      res.redirect("/admin/forget-password");
    } catch (error) {
      res.redirect("/admin/forget-password");
      console.log(error);
    }
  }
  async passwordresetconfirmation(req, res) {
    try {
      const token = await userRepository.getToken({ token: req.params.token });

      if (!token) {
        const { email } = req.params;
        const user = await userRepository.findUser({ email });
        const token_model = new TokenModel({
          _userId: user._id,
          token: crypto.randomBytes(16).toString("hex"),
        });
        await token_model.save();

        const senderEmail = process.env.MAIL_ID;
        const senderPassword = process.env.PASSWORD;
        const transport = createTransporter(senderEmail, senderPassword);
        const mailOptions = {
          from: senderEmail,
          to: email,
          subject: "Forgot Password",
          html: `
        <p>This is a new link for creating a new password which will expire in 10 mins \n\n click the link below to create a new password:</p>
        <a href="http://${req.headers.host}:${process.env.PORT}/admin/password-reset/confirmation/${email}/${token_model.token}">
        Reset Password
        </a>
        <p>Thank you!</p>
         `,
        };
        mailSend(req, res, transport, mailOptions);

        console.log(
          `reset link may be expired,New reset link sent to ${email}`
        );
      } else {
        const user = await userRepository.findUser({
          _id: token._userId,
          email: req.params.email,
        });
        if (!user) {
          console.log("User not found");
        }
        if (user.isVerified) {
          console.log("User verified now you can reset password");
          res.redirect("/admin/new-password");
        }
      }
    } catch (error) {
      console.log("User verified now you can reset password");
    }
  }
  async newPasswordReset(req, res) {
    try {
      const email = req.params.email;
      const user = await userRepository.findUser({ email });
      const userId = user._id;
      const token = await userRepository.getToken({ _userId: userId });
      if (token) {
        await TokenModel.deleteOne({ _id: token._id });
      }
      const newPassword = req.body.newPassword;
      const hashedPassword = await hashPassword(newPassword);
      await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });
      console.log(" password reset successfully");
    } catch (error) {
      console.log(`Error in password reset ${error}`);
    }
  }

  async registerUser(req, res) {
    const schema = Joi.object({
      first_name: Joi.string().min(3).max(30).required(),
      last_name: Joi.string().min(3).max(30).required(),
      email: Joi.string()
        .email()
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
        .required(),
      password: Joi.string()
        .min(8)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required(),
      username: Joi.string().min(3).max(30).required(),
    });

    try {
      const { error } = schema.validate(req.body);
      if (error) {
        console.log("Validation error:", error.details[0].message);
        return res.redirect("/admin/register");
      }
      const { first_name, last_name, email, password, username } = req.body;

      const existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        console.log("Already registered with this email");
        return res.redirect("/admin/register");
      }
      const role = "admin";

      let roleDoc = await RoleModel.findOne({ name: role });
      if (!roleDoc) {
        roleDoc = await new RoleModel({ name: role }).save();
      }

      const hashedPassword = await hashPassword(password);
      const user = new UserModel({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        role: roleDoc._id,
        username,
        profilePicture: req.file?.path,
      });

      const newUser = await user.save();
      if (!newUser) {
        console.log("Failed to register user");
        return res.redirect("/admin/register");
      }

      const token_model = await new TokenModel({
        _userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      }).save();

      const senderEmail = process.env.MAIL_ID;
      const senderPassword = process.env.PASSWORD;
      const transport = createTransporter(senderEmail, senderPassword);

      const mailOptions = {
        from: senderEmail,
        to: user.email,
        subject: "Email Verification",
        html: `
        <p>Hello ${user.first_name},</p>
        <p>Please verify your account by clicking the link below:</p>
        <a href="http://${req.headers.host}/confirmation/${user.email}/${token_model.token}">
          Verify Email
        </a>
        <p>Thank you!</p>
      `,
      };
      const response = transport.sendMail(mailOptions);
      if (response) {
        console.log(`Verification link sent successfully to ${user.email}`);
        res.redirect("/");
      }
    } catch (error) {
      console.error(`Error in registration: ${error.message}`);
      res.redirect("/admin/register");
    }
  }

  async confirmation(req, res) {
    try {
      const token = await userRepository.findToken({ token: req.params.token });
      if (!token) {
        const { email } = req.params;
        const user = await userRepository.findUser({ email });
        const token_model = new TokenModel({
          _userId: user._id,
          token: crypto.randomBytes(16).toString("hex"),
        });
        await token_model.save();

        const senderEmail = process.env.MAIL_ID;
        const senderPassword = process.env.PASSWORD;
        const transport = createTransporter(senderEmail, senderPassword);
        const mailOptions = {
          from: senderEmail,
          to: email,
          subject: "Email Verification",
          html: `
        <p>This is a new link for verifying your email which will expire in 10 mins. Click the link below to verify:</p>
         <a href="http://${req.headers.host}/confirmation/${user.email}/${token_model.token}">
        Verify Email
        </a>
        <p>Thank you!</p>
         `,
        };
        mailSend(req, res, transport, mailOptions);
        res.redirect("/admin/register");
        console.log(
          `Verification link may be expired. A new verification link has been sent to ${email}`
        );
      } else {
        const user = await userRepository.findUser({
          _id: token._userId,
          email: req.params.email,
        });

        if (!user) {
          res.redirect("/admin/register");
          console.log("User not found");
        }
        if (user.isVerified) {
          res.redirect("/admin/register");
          console.log("User already verified");
        }
        user.isVerified = true;
        await user.save();
        res.redirect("/");
        console.log(
          "User verified successfully. Now you can log in to your account."
        );
      }
    } catch (error) {
      res.redirect("/admin/register");
      console.log("Error in email verification");
    }
  }
  async loginUser(req, res) {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
        .required(),
      password: Joi.string().min(8).required(),
    });
     const { error } = schema.validate(req.body);
     if (error) {
       console.log("Validation error:", error.details[0].message);
       return res.redirect("/");
     }
    try {
      const { email, password } = req.body;
      const user = await userRepository.findUser({ email });

      if (!user) {
        console.log("Email is not registered");
        return res.redirect("/");
      }

      if (user.isVerified === false) {
        console.log("User not verified");
        return res.redirect("/");
      }

      const match = await comparePassword(password, user.password);

      if (!match) {
        console.log("Invalid password");
        return res.redirect("/");
      }

      const role = await RoleModel.findOne({ _id: user.role });
      let token;
      if (role.name === "admin") {
        token = jwt.sign(
          { _id: user._id, role: role.name, email: user.email },
          process.env.ADMIN_SECRET,
          {
            expiresIn: "24h",
          }
        );
        res.cookie("adminToken", token);
        res.cookie("adminId", user._id);
      }
      if (role.name === "instructor") {
        token = jwt.sign(
          { _id: user._id, role: role.name, email: user.email },
          process.env.INSTRUCTOR_SECRET,
          {
            expiresIn: "24h",
          }
        );
        res.cookie("instructorToken", token);
        res.cookie("instructorId", user._id);
      }

      console.log("Login successful");
      if (role.name === "instructor") {
        return res.redirect(`/instructor/dashboard`);
      } else if (role.name === "admin") {
        return res.redirect(`/admin/dashboard`);
      } else {
        console.log(`${role.name} are not allowed to login here`);
        return res.redirect(`/`);
      }
    } catch (error) {
      console.error(`Login unsuccessful: ${error.message}`);
      return res.redirect("/");
    }
  }
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.admin._id;
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.redirect("/admin/update-password"); 
      }

      // Check if current password matches
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        req.flash("error", "Incorrect current password");
        return res.redirect("/admin/update-password"); 
      }

      // Hash the new password
      const hashPass = await hashPassword(newPassword);
      user.password = hashPass;
      await user.save();
      res.redirect("/admin/dashboard"); 
      console.log('password updated successfully')
    } catch (error) {
      console.error(`Error updating password: ${error}`);
      res.redirect("/admin/update-password");
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("id");
      res.clearCookie("adminToken");
      res.redirect("/");
      console.log("Logout successfully");
    } catch (err) {
      console.log(err);
    }
  }
}
const adminAuthWebController = new AdminAuthWebController();
module.exports = adminAuthWebController;
