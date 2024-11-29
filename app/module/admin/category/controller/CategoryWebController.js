const UserModel = require("../../auth/model/user.model");
const CategoryModel = require("../model/category.model");


class AdminCategoryWebController {
  async list(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      return res.render("admin/category/list.ejs", {
        title: "categories",
        user:user
      });
    } catch (error) {
      console.error("Error rendering category list page:", error);
    }
  }
  async toggleCategoryStatus(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Toggle status
      category.status = category.status === "active" ? "inactive" : "active";

      // Save the updated category
      await category.save();
        res.redirect('/admin/categories');
     
    } catch (error) {
             res.redirect("/admin/categories");

    }
  }
}

const adminCategoryWebController = new AdminCategoryWebController();
module.exports = adminCategoryWebController;
