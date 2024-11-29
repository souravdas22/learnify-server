const CategoryModel = require("../module/admin/category/model/category.model");
const { updateSearchIndex } = require("../module/admin/contact/model/contact.model");

class CategoryApiController {
  // Create a new category
  async createCategory(req, res) {
    try {
      const { name } = req.body;

      const existingCategory = await CategoryModel.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" });
      }

      const newCategory = new CategoryModel({
        name,
      });
      if (req.file) {
        newCategory.thumbnail = req.file.path;
      }

      await newCategory.save();
      res
        .status(201)
        .json({
          status: 201,
          message: "Category created successfully",
          data: newCategory,
        });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating category", error: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;

      const updates = req.body;
      if (req.file) {
        updates.thumbnail = req.file.path; 
      }

      // Update category with the provided fields
      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
        }
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating category", error: error.message });
    }
  }

  // Get all categories with a specific status (active or inactive)
  async getCategoriesByStatus(req, res) {
    try {
      const categories = await CategoryModel.find({ status: "active" });

      res
        .status(200)
        .json({ status: 200, data: categories, total: categories.length });
    } catch (error) {
      res.status(500).json({
        message: `Error fetching ${status} categories`,
        error: error.message,
      });
    }
  }
  async getCategoriesByStatusForAdmins(req, res) {
    try {
      const categories = await CategoryModel.find();

      res
        .status(200)
        .json({ status: 200, data: categories, total: categories.length });
    } catch (error) {
      res.status(500).json({
        message: `Error fetching ${status} categories`,
        error: error.message,
      });
    }
  }

  // Toggle category status (active / inactive)
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

      res.status(200).json({
        message: "Category status updated successfully",
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating category status",
        error: error.message,
      });
    }
  }

  // Get a single category by ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ status: 200, data: category });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching category", error: error.message });
    }
  }

  // Update a category
}

const categoryApiController = new CategoryApiController();
module.exports = categoryApiController;
