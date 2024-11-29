const UserModel = require("../../auth/model/user.model");

class AdminPaymentWebController {
  async list(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
        return res.render("admin/ticket/list.ejs", {
          title: "payments",
          user:user
      });
    } catch (error) {
      console.error("Error rendering payment list page:", error);
    }
  }

}

const adminPaymentWebController = new AdminPaymentWebController();
module.exports = adminPaymentWebController;
