const { default: mongoose } = require("mongoose");
const { CourseModel } = require("../../course/model/course.model");
const UserModel = require("../../auth/model/user.model");

class AdminLessonWebController {
  async list(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      res.render("admin/lesson/list.ejs", {
        title: " Lessons",
        user:user
      });
    } catch (err) {
      console.log(err);
    }
  }
  async addLesson(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      const courseId = req.params.courseId;
      res.render("admin/lesson/add.ejs", { courseId: courseId ,title:"add lesson",user:user});
    } catch (err) {
      console.log(err);
    }
  }
  async courseLessons(req, res) {
    try {
      const courseId = req.params.courseId;
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      res.render("admin/lesson/list.ejs", { courseId: courseId ,title:"course lessons",user:user});
    } catch (err) {}
  }
  async activeCourse(req, res) {
    try {
      const courses = await CourseModel.find();
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      res.render("admin/lesson/active-course.ejs", {
        title: "Active Courses",
        courses: courses,
        user:user
      });
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).send("An error occurred while fetching courses.");
    }
  }
}
const adminLessonWebController = new AdminLessonWebController();
module.exports = adminLessonWebController;
