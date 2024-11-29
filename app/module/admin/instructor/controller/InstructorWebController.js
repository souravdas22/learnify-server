const UserModel = require("../../auth/model/user.model");

class InstructorWebController {
  async list(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      return res.render("admin/instructors/list.ejs", {
        title: "instructors",
        user:user
      });
    } catch (error) {
      console.error("Error rendering instructor list page:", error);
    }
  }
  async add(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      return res.render("admin/instructors/add.ejs", {
        title: "add instructor",
        user:user
      });
    } catch (error) {
      console.error("Error rendering instructor add page:", error);
    }
  }
  async edit(req, res) {
    try {
      const id = req.params.id;
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      const instructor = await UserModel.findOne({ _id: id });
      return res.render("admin/instructors/edit.ejs", {
        instructor: instructor,
        title: "edit instructor",
        user:user
      });
    } catch (error) {
      console.error("Error rendering instructor edit page:", error);
    }
  }
}

const instructorWebController = new InstructorWebController();
module.exports = instructorWebController;
