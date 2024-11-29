const UserModel = require("../../auth/model/user.model");

class AdminContactWebController {
  async list(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      return res.render("admin/contact/list.ejs", {
        title: "contacts",
        user:user

      });
    } catch (error) {
      console.error("Error rendering contact list page:", error);
    }
  }
}

const adminContactWebController = new AdminContactWebController();
module.exports = adminContactWebController;
