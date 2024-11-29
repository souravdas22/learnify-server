const express = require("express");
const categoryApiController = require("../../app/webservice/CategoryApiController");
const uploadCategoryThumbnail = require("../../app/helper/categoryThumbnailUpload");
const { AuthCheck } = require("../../app/middleware/authHelper");

const categoryRouter = express.Router();

// Route to create a new category
categoryRouter.post(
  "/api/category/create",
  uploadCategoryThumbnail.single("thumbnail"),
  AuthCheck,
  categoryApiController.createCategory
);

categoryRouter.post(
  "/api/category/edit/:id",
  uploadCategoryThumbnail.single("thumbnail"),
  AuthCheck,
  categoryApiController.updateCategory
);


// Route to fetch all categories
categoryRouter.get(
  "/api/categories",
  AuthCheck,
  categoryApiController.getCategoriesByStatus
);
categoryRouter.get(
  "/api/admin/categories",
  AuthCheck,
  categoryApiController.getCategoriesByStatusForAdmins
);
categoryRouter.get(
  "/api/category/:id",
  AuthCheck,
  categoryApiController.getCategoryById
);




module.exports = (app) => {
  app.use(categoryRouter);
};
