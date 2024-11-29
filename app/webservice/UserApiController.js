const jwt = require("jsonwebtoken");
const fs = require("fs");
const {
  hashPassword,
  createTransporter,
  mailSend,
  comparePassword,
} = require("../middleware/authHelper");
const crypto = require("crypto");
const { default: mongoose } = require("mongoose");
const path = require("path");
const RoleModel = require("../module/role/model/role.model");
const userRepository = require("../module/admin/auth/repository/userRepository");
const TokenModel = require("../module/admin/auth/model/token.model");
const UserModel = require("../module/admin/auth/model/user.model");
const InstructorDetailsModel = require("../module/admin/auth/model/instructorDetails.model");
const Joi = require("joi");


class UserApiController {
  async register(req, res) {
      const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string()
          .email()
          .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
          .required()
          .messages({
            "string.pattern.base": "Please enter a valid email address.",
            "string.email": "Please enter a valid email address.",
          }),
        password: Joi.string()
          .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          .required()
          .messages({
            "string.pattern.base":
              "Password must be at least 8 characters long and contain at least one letter, one number, and one special character.",
          }),
        enrolledCourses: Joi.array().items(Joi.string()),
        username: Joi.string().required(),
        role: Joi.string().optional(),
      });
      const { error } = schema.validate(req.body);
      if (error)
        return res
          .status(400)
          .send({ status: 400, message: error.details[0].message });
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        enrolledCourses,
        username,
      } = req.body;
      let role = req.body.role;
      console.log(req.body);
      const existingUser = await userRepository.findUser({ email });
      if (existingUser) {
        return res.status(409).send({
          success: 409,
          message: "already registered with this email",
        });
      }
      if (!role) {
        role = "student";
      }
      console.log(role);
      let roleDoc = await RoleModel.findOne({ name: role });
      if (!roleDoc) {
        roleDoc = new RoleModel({ name: role });
        await roleDoc.save();
      }
      //password hash
      const hashedPassword = await hashPassword(password);
      const user = new UserModel({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        role: roleDoc._id,
        enrolledCourses,
        username,
      });
      if (req.file) {
        user.profilePicture = req.file.path;
      }
      const newUser = await userRepository.save(user);
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
        subject: "Email Verification",
        text: `Hello ${user.first_name}`,
        html: `
    <p>Hello ${user.first_name},</p>
    <p>Please verify your account by clicking the link below:</p>
    <a href="http://${req.headers.host}/api/confirmation/${user.email}/${token_model.token}">
      Verify Email
    </a>
    <p>Thank you!</p>
  `,
      };

      if (!newUser) {
        return res.status(500).json({ message: "failed to register user" });
      }
      mailSend(req, res, transport, mailOptions);
      return res.status(201).send({
        status: 201,
        message: `Verification link sent successfully to ${user.email}`,
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: "Error in registration",
        error: error,
      });
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
         <a href="http://${req.headers.host}/api/confirmation/${user.email}/${token_model.token}">
        Verify Email
        </a>
        <p>Thank you!</p>
         `,
        };
        mailSend(req, res, transport, mailOptions);

        return res.status(400).send({
          status: 400,
          message: `Verification link may be expired. A new verification link has been sent to ${email}`,
        });
      } else {
        const user = await userRepository.findUser({
          _id: token._userId,
          email: req.params.email,
        });
        if (!user) {
          return res.status(404).send({
            status: 404,
            message: "User not found",
          });
        }
        if (user.isVerified) {
          return res.status(400).send({
            status: 400,
            message: "User already verified",
          });
        }
        user.isVerified = true;
        await user.save();
        return res.redirect("http://localhost:3000/");
       
      }
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: "Error in email verification",
        error: error.message,
      });
    }
  }

  async login(req, res) {
      const schema = Joi.object({
        email: Joi.string()
          .email()
          .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
          .required()
          .messages({
            "string.pattern.base": "Please enter a valid email address.",
            "string.email": "Please enter a valid email address.",
          }),
        password: Joi.string()
          .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          .required()
          .messages({
            "string.pattern.base":
              "Password must be at least 8 characters long and contain at least one letter, one number, and one special character.",
          }),
      });
      const { error } = schema.validate(req.body);
      if (error)
        return res
          .status(400)
          .send({ status: 400, message: error.details[0].message });
    try {
      const { email, password } = req.body;
      const user = await userRepository.findUser({ email });

      if (!user) {
        return res.status(404).send({
          status: 404,
          message: "Email is not registered",
        });
      }
      if (user.isVerified === false) {
        return res.status(401).send({
          status: 401,
          message: "User not verified",
        });
      }
      const match = await comparePassword(password, user.password);

      if (!match) {
        return res.status(401).send({
          status: 401,
          message: "Invalid password",
        });
      }
      const role = await RoleModel.findOne({ _id: user.role });
      const token = jwt.sign(
        { userId: user._id, role: role.name, email: user.email },
        process.env.STUDENT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Login successful",
        data: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: email,
          role: role.name,
          enrolledCourses: user.enrolledCourses,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: `Login unsuccessful ${error}`,
      });
    }
  }

  async userDetails(req, res) {
    try {
      const id = req.params.id;
      const user = await UserModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $project: {
            password: 0,
          },
        },
      ]);
      return res.status(200).send({
        status: 200,
        message: "User details fetched successfully",
        data: user[0],
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: "Error fetching user details",
        error: error.message,
      });
    }
  }
  async instructorDetails(req, res) {
    try {
      const id = req.params.id;
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
      return res.status(200).send({
        status: 200,
        message: "User details fetched successfully",
        data: user[0],
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: "Error fetching user details",
        error: error.message,
      });
    }
  }

  async editUser(req, res) {
    try {
      const data = req.body;
      const id = req.params.id;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).send({
          status: 404,
          message: "User not found",
        });
      }

      if (req.file) {
        if (user.profilePicture) {
          const existingImagePath = path.resolve(
            "uploads/users",
            path.basename(user.profilePicture)
          );
          fs.unlink(existingImagePath, (err) => {
            if (err) {
              console.error("Error deleting the existing image:", err);
            } else {
              console.log("Existing image deleted successfully");
            }
          });
        }
        const imagePath = `uploads/users/${req.file.filename}`.replace(
          /\\/g,
          "/"
        );
        data.profilePicture = imagePath;
      }
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      res.status(200).json({
        status: 200,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        message: `Error in user update: ${err}`,
      });
    }
  }
  async usersbyRole(req, res) {
    try {
      const role = req.params.role;
      const InstructorRole = await RoleModel.findOne({ name: role });
      if (!InstructorRole) {
        return res.status(404).json({ status: 404, message: "role not found" });
      }
      const data = await UserModel.find({ role: InstructorRole._id });
      res.status(200).json({
        status: 200,
        message: `${role}s fetched successfully`,
        data: data,
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: 500, message: `Internal server error ${error}` });
    }
  }
  async createUser(req, res) {
    try {
      const { first_name, last_name, email, password, role, username } =
        req.body;
      const existingUser = await userRepository.findUser({ email });
      if (existingUser) {
        return res.status(409).json({
          success: 409,
          message: "already registered with this email",
        });
      }
      let roleDoc = await RoleModel.findOne({ name: role });
      if (!roleDoc) {
        roleDoc = new RoleModel({ name: role });
        await roleDoc.save();
      }
      const hashedPassword = await hashPassword(password);
      const user = new UserModel({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        role: roleDoc._id,
        username,
      });
      if (req.file) {
        user.profilePicture = req.file.path;
      }
      const newUser = await userRepository.save(user);
      res
        .status(201)
        .json({ status: 201, message: `new ${role} created successfully` });
    } catch (err) {
      res
        .status(500)
        .json({ status: 500, message: `Internal server error ${err}` });
    }
  }
  async updateUser(req, res) {
    try {
      const { first_name, last_name, email, password, username } = req.body;
      const id = req.params.id;
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      if (first_name) user.first_name = first_name;
      if (last_name) user.last_name = last_name;
      if (email) user.email = email;
      if (username) user.username = username;

      // Password update logic
      if (password) {
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;
      }

      if (req.file) {
        user.profilePicture = req.file.path;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, user, {
        new: true,
      });

      // Return the success response
      res.status(200).json({
        status: 200,
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        message: `Internal server error: ${err.message}`,
      });
    }
  }
  async getInstructors(req, res) {
    try {
      const instructorRole = await RoleModel.findOne({ name: "instructor" });
      const instructors = await UserModel.find({ role: instructorRole._id });
      res
        .status(200)
        .json({ message: "instructors fetched successfully", instructors });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: `Internal server error: ${err}`,
      });
    }
  }
  async getEnrolledCourss(req, res) {
    try {
      const userId = req.params.id;
      const courses = await UserModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "enrolledCourses",
            foreignField: "_id",
            as: "enrolledCourseDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "enrolledCourseDetails.instructor",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $project: {
            enrolledCourses: 0,
          },
        },
      ]);
      res.status(200).json({
        status: 200,
        message: "enrolled courses fetched successfylly",
        courses: courses[0],
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        message: `Internal server error: ${err}`,
      });
    }
  }
  async updateInstructorDetails(req, res) {
    try {
      const { userId, expertise, bio } = req.body;

      // Check if the instructor details already exist
      let instructorDetails = await InstructorDetailsModel.findOne({ userId });

      if (instructorDetails) {
        // Update existing instructor details
        instructorDetails = await InstructorDetailsModel.findByIdAndUpdate(
          instructorDetails._id,
          { expertise, bio },
          { new: true } // This ensures that the updated document is returned
        );
      } else {
        // If no instructor details exist, create new ones
        instructorDetails = new InstructorDetailsModel({
          userId,
          expertise,
          bio,
        });
        await instructorDetails.save();
      }

      // Update the User model with the reference to the instructor details
      await UserModel.findByIdAndUpdate(userId, {
        instructorDetails: instructorDetails._id,
      });

      res.status(200).json({
        message: "Instructor details updated successfully",
        instructorDetails,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating instructor details", err });
    }
  }
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.params.id;
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect current password" });
      }
      const hashPass = await hashPassword(newPassword);
      user.password = hashPass;
      await user.save();
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error updating password details ${error}` });
    }
  }

  // forgot password

  async forgetPassword(req, res) {
    try {
      const { email } = req.body;
      //check user
      const user = await userRepository.findUser({ email });
      if (!user) {
        return res.status(404).send({
          status: 404,
          message: "Email is not registered",
        });
      }
      if (user.isVerified === false) {
        return res.status(500).send({
          status: 500,
          message: "email is not verified",
        });
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
         <a href="${process.env.LOCAL_PORT_URL}/api/password-reset/confirmation/${user.email}/${token_model.token}">
        Reset Password
        </a>
        <p>Thank you!</p>
         `,
      };
      if (user.isVerified) {
        mailSend(req, res, transport, mailOptions);
      }

      return res.status(200).send({
        status: 200,
        message: "password reset link sent successfully on your email",
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: "Error in password reset",
        error: error.message,
      });
    }
  }
  // reset email confirmation
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
        <a href="http://${req.headers.host}:${process.env.PORT}/api/password-reset/confirmation/${email}/${token_model.token}">
        Reset Password
        </a>
        <p>Thank you!</p>
         `,
        };
        mailSend(req, res, transport, mailOptions);

        return res.status(400).send({
          status: 400,
          message: `reset link may be expired,New reset link sent to ${email}`,
        });
      } else {
        const user = await userRepository.findUser({
          _id: token._userId,
          email: req.params.email,
        });
        if (!user) {
          return res.status(404).send({
            status: 404,
            message: "User not found",
          });
        }
        if (user.isVerified) {
          res.redirect("http://localhost:3000/new-password");

        }
      }
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: "Error in email verification",
      });
    }
  }
  // new reset password
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
      res.status(200).send({
        status: 200,
        message: " password reset successfully",
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: "Error in password reset",
      });
    }
  }
}

const userApiController = new UserApiController();
module.exports = userApiController;
