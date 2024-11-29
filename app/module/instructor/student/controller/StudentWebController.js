const UserModel = require('../../../admin/auth/model/user.model')
class InstructorStudentWebController {
  async list(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      return res.render("instructor/students/list.ejs", {
        title: "Students",
        user
      });

    } catch (error) {
      console.error("Error rendering student list page:", error);
    }
  }
  async add(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      return res.render("instructor/students/add.ejs", {
        title: "add Students",
        user
      });
    } catch (error) {
      console.error("Error rendering student add page:", error);
    }
  }
  async edit(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      const id = req.params.id;
      const student = await UserModel.findOne({ _id: id });
      return res.render("instructor/students/edit.ejs", {
        student: student,
        title: "edit student",
        user
      });
    } catch (error) {
      console.error("Error rendering student edit page:", error);
    }
  }
}

const instructorStudentWebController = new InstructorStudentWebController();
module.exports = instructorStudentWebController;
