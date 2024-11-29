const UserModel = require("../../../admin/auth/model/user.model");

class InstructorMesssageWebController {
  async list(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      res.render("instructor/message/list.ejs", {
        title: "Instructor Courses",
        user
     
      });
    } catch (err) {
      console.log(err);
    }
  }
}
const instructorMesssageWebController = new InstructorMesssageWebController();
module.exports = instructorMesssageWebController;
