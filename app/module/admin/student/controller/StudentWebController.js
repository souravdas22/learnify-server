const UserModel = require("../../auth/model/user.model");

class StudentWebController {
  async list(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      return res.render("admin/students/list.ejs", {
        title: "students",
        user:user
      });
    } catch (error) {
      console.error("Error rendering student list page:", error);
    }
  }
  async add(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      return res.render("admin/students/add.ejs", {
        title: "add student",
        user:user
      });
    } catch (error) {
      console.error("Error rendering student add page:", error);
    }
  }
  async edit(req, res) {
    try {
      const id = req.params.id;
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      const student = await UserModel.findOne({ _id: id });
      return res.render("admin/students/edit.ejs", {
        student: student,
        title: "edit student",
        user:user
      });
    } catch (error) {
      console.error("Error rendering student edit page:", error);
    }
  }
}

const studentWebController = new StudentWebController();
module.exports = studentWebController;
