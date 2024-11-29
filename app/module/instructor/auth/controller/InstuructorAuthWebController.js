const {
  comparePassword,
  hashPassword,
  createTransporter,
  mailSend,
} = require("../../../../middleware/authHelper");
const RoleModel = require("../../../role/model/role.model");
const TokenModel = require("../../../admin/auth/model/token.model");
const UserModel = require("../../../admin/auth/model/user.model");
const userRepository = require("../../../admin/auth/repository/userRepository");
const crypto = require("crypto");
const { CourseModel } = require("../../../admin/course/model/course.model");
const PaymentModel = require("../../../admin/payment/payment.model");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");

class InstructorAuthWebController {
  async dashboard(req, res) {
    try {
      const id = req.cookies.instructorId;
      const _id = req.instructor._id;
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
          $match: {
            instructor: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $group: {
            _id: "$instructor",
            totalCourses: { $sum: 1 }, // Count all courses
            totalActiveCourses: {
              $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] }, // Count published courses
            },
            uniqueStudents: { $addToSet: "$students" }, // Collect unique student IDs
          },
        },
        {
          $project: {
            _id: 1,
            totalCourses: 1,
            totalActiveCourses: 1,
            totalStudents: {
              $size: {
                $reduce: {
                  input: "$uniqueStudents",
                  initialValue: [],
                  in: { $setUnion: ["$$value", "$$this"] },
                },
              },
            },
          },
        },
      ]);
      res.render("instructor/dashboard/dashboard.ejs", {
        title: "Instructor Dashboard",
        courseData: courseData[0],
        earningData: earningData[0],
        user,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async viewupdatepassword(req, res) {
    try {
      const _id = req.instructor._id;
      const user = await UserModel.findOne({ _id });
      res.render("instructor/password/update-password.ejs", {
        title: "Instructor update password",
        user
      });
    } catch (err) {
      console.log(err);
    }
  }
  async userDetails(req, res) {
    try {
      const id = req.cookies.instructorId;
      const user = await UserModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "instructordetails",
            localField: "_id",
            foreignField: "userId",
            as: "userDetails",
          },
        },
        {
          $project: {
            biography: 0,
            instructorDetails: 0,
            role: 0,
            enrolledCourses: 0,
          },
        },
      ]);
      res.render("instructor/dashboard/profile.ejs", {
        title: "Instructor Profile",
        id: id,
        user: user[0],
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
      res.render("instructor/dashboard/register.ejs", {
        title: "Instructor register",
      });
    } catch (err) {
      console.log(err);
    }
  }

  async registerUser(req, res) {
    try {
      console.log(req.body);
      const { first_name, last_name, email, password, username } = req.body;
      const existingUser = await userRepository.findUser({ email });

      if (existingUser) {
        console.log("Already registered with this email");
        return res.redirect("/instructor/register");
      }
      const role = "instructor";

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

      const newUser = await userRepository.save(user);
      if (!newUser) {
        console.log("Failed to register user");
        return res.redirect("/instructor/register");
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
      res.redirect("/instructor/register");
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
        res.redirect("/instructor/register");
        console.log(
          `Verification link may be expired. A new verification link has been sent to ${email}`
        );
      } else {
        const user = await userRepository.findUser({
          _id: token._userId,
          email: req.params.email,
        });

        if (!user) {
          res.redirect("/instructor/register");
          console.log("User not found");
        }
        if (user.isVerified) {
          res.redirect("/instructor/register");
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
      res.redirect("/instructor/register");
      console.log("Error in email verification");
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("id");
      res.clearCookie("instructorToken");
      res.redirect("/");
      console.log("Logout successfully");
    } catch (err) {
      console.log(err);
    }
  }
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.instructor._id;
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.redirect("/instructor/update-password");
      }

      // Check if current password matches
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return res.redirect("/instructor/update-password");
      }

      // Hash the new password
      const hashPass = await hashPassword(newPassword);
      user.password = hashPass;
      await user.save();
      res.redirect("/instructor/dashboard");
      console.log("password updated successfully");
    } catch (error) {
      console.error(`Error updating password: ${error}`);
      res.redirect("/instructor/update-password");
    }
  }
}
const instructorAuthWebController = new InstructorAuthWebController();
module.exports = instructorAuthWebController;
