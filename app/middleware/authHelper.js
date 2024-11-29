const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createTransporter = (senderEmail, senderPassword) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
  });
  return transporter;
};

// Send Mail
const mailSend = (req, res, transport, mailOptions) => {
  transport.sendMail(mailOptions, (error) => {
    if (error) {
      return res.status(500).send({
        status: 500,
        message: "Technical Issue",
        error: error,
      });
    } else {
      return res.status(200).send({
        status: 200,
        message:
          "A verification Email has bee send to your mail, please click the link to verify or else it will get expire in 24hrs",
        error: error,
      });
    }
  });
};

const hashPassword = async (password) => {
  try {
    const saltPassword = 10;
    const hashedPassword = await bcrypt.hash(password, saltPassword);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const adminAuthCheck = async (req, res, next) => {
  const token = req.cookies.adminToken || req.query.adminToken;

  if (!token) {
    console.log("A token is required for authentication");
    return res.redirect("/");
  }
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    console.log(`Invalid token: ${error}`);
  }
};
const verifyAdminRole = async (req, res, next) => {
  if (!req.admin || req.admin.role !== "admin") {
    console.log(`${req.admin ? req.admin.role : "Unknown"} cannot login here`);
    return res.redirect("/");
  }
  next();
};

const instructorAuthCheck = async (req, res, next) => {
  const token = req.cookies.instructorToken || req.query.instructorToken;

  if (!token) {
    console.log("A token is required for authentication");
    return res.redirect("/");
  }
  try {
    const decoded = jwt.verify(token, process.env.INSTRUCTOR_SECRET);
    req.instructor = decoded;
    next();
  } catch (error) {
    console.log(`Invalid token: ${error}`);
  }
};

const verifyInstructorRole = async (req, res, next) => {
  if (!req.instructor || req.instructor.role !== "instructor") {
    console.log(
      `${req.instructor ? req.instructor.role : "Unknown"} cannot login here`
    );
    return res.redirect("/");
  }
  next();
};


const AuthCheck = async (req, res, next) => {
  const token =
    req.body.token ||
    req.headers["x-access-token"] ||
    req.cookies.adminToken ||
    req.cookies.instructorToken 
  if (!token) {
    return res.status(403).send({
      status: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    let decoded;
    if (req.cookies.adminToken) {
      decoded = jwt.verify(token, process.env.ADMIN_SECRET);
      req.admin = decoded;
    } else if (req.cookies.instructorToken) {
      decoded = jwt.verify(token, process.env.INSTRUCTOR_SECRET);
      req.instructor = decoded;
    } else if (req.headers["x-access-token"]) {
      decoded = jwt.verify(token, process.env.STUDENT_SECRET);
      req.user = decoded;
    } else {
      throw new Error("Token role mismatch.");
    }

    next();
  } catch (error) {
    return res.status(401).send({
      status: false,
      message: `Invalid token. ${error.message}`,
    });
  }
};



module.exports = {
  hashPassword,
  comparePassword,
  mailSend,
  createTransporter,
  adminAuthCheck,
  verifyAdminRole,
  instructorAuthCheck,
  verifyInstructorRole,
  AuthCheck,
};
