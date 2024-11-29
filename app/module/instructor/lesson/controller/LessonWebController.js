const { default: mongoose } = require("mongoose");
const { CourseModel } = require("../../../admin/course/model/course.model");
const UserModel = require("../../../admin/auth/model/user.model");

class InstructorLessonWebController {
  async list(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      res.render("instructor/lesson/list.ejs", {
        title: "lessons",
        user
      });
  
    } catch (err) {
      console.log(err);
    }
  }
  async addLesson(req, res) {
    try {
      const courseId = req.params.courseId;
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      res.render("instructor/lesson/add.ejs", { courseId: courseId , title:"add lesson",user});
    } catch (err) {
      console.log(err);
    }
  }
  async courseLessons(req, res) {
    try {
      const courseId = req.params.courseId;
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      res.render("instructor/lesson/list.ejs", { courseId: courseId, title:"course lessons",user });
    } catch (err) {}
  }
  async activeCourse(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      const courses = await CourseModel.find();
      res.render("instructor/lesson/active-course.ejs", {
        title: "instructor active Courses",
        courses: courses,
        user
      });
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).send("An error occurred while fetching courses.");
    }
  }
}
const instructorLessonWebController = new InstructorLessonWebController();
module.exports = instructorLessonWebController;
