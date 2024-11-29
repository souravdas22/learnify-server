const UserModel = require("../../auth/model/user.model");

class AdminMesssageWebController {
  async list(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      res.render("admin/message/list.ejs", {
        title: "Admin Courses",
        user:user
     
      });
    } catch (err) {
      console.log(err);
    }
  }
}
const adminMesssageWebController = new AdminMesssageWebController();
module.exports = adminMesssageWebController;
