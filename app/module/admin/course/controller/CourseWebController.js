const { default: mongoose } = require("mongoose");
const { CourseModel } = require("../model/course.model");
const UserModel = require("../../auth/model/user.model");

class AdminCourseWEbController {
  async list(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      res.render("admin/course/list.ejs", {
        title: "Admin Courses",
        user:user
      });
    } catch (err) {
      console.log(err);
    }
  }
  async addCourse(req, res) {
    try {
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      res.render("admin/course/add.ejs", {
        title: "Admin Courses",
        user:user
      });
    } catch (err) {
      console.log(err);
    }
  }
  async deleteCourse(req, res) {
    try {
      const id = req.params.id;
      await CourseModel.findByIdAndDelete(id);
      res.redirect('/admin/courses')
    } catch (err) {
      res.redirect("/admin/courses");
    }
  }
  async updateCourse(req, res) {
    try {
      const id = req.params.id;
       const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      const course = await CourseModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
      ]);
      res.render("admin/course/edit.ejs", {
        course: course[0],
        user: user,
        title:"update course"
      });
    } catch (err) {
      console.log(err);
    }
  }
  async createCourse(req, res) {
    try {
      const {
        title,
        description,
        price,
        instructor,
        courseType,
        category,
        rating,
        videos,
      } = req.body;
      const instructorId = "672f11d669851b16cda01787";
      const newCourse = new CourseModel({
        title,
        description,
        price,
        instructor: instructorId,
        courseType,
        category,
        rating,
        videos,
      });
      if (req.file) {
        newCourse.thumbnail = req.file.path;
      }
      await newCourse.save();
      res.redirect("/admin/courses");
      console.log(`Course created successfully`);
    } catch (err) {
      res.redirect("/admin/course/create");
    }
  }
  async editCourse(req, res) {
    try {
      const courseId = req.params.id;
      const {
        title,
        description,
        price,
        courseType,
        category,
        rating,
        videos,
      } = req.body;

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).send("Course not found");
      }

      course.title = title || course.title;
      course.description = description || course.description;
      course.price = price || course.price;
      course.courseType = courseType || course.courseType;
      course.category = category || course.category;
      course.rating = rating || course.rating;
      course.videos = videos || course.videos;

      if (req.file) {
        course.thumbnail = req.file.path;
      }
      await course.save();
      res.redirect("/admin/courses");
      console.log(`Course updated successfully`);
    } catch (err) {
      console.error("Error updating course:", err);
      res.redirect(`/admin/course/update/${req.params.id}`);
    }
  }
  async ActivateCourse(req, res) {
    try {
      const id = req.params.id;
      await CourseModel.findByIdAndUpdate(
        id,
        { status: "published" },
        { new: true }
      );
      res.redirect("/admin/courses");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/courses");
    }
  }
  async deactiveCourse(req, res) {
    try {
      const id = req.params.id;
      await CourseModel.findByIdAndUpdate(
        id,
        { status: "rejected" },
        { new: true }
      );
      res.redirect("/admin/courses");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/courses");
    }
  }
}
const adminCourseWebController = new AdminCourseWEbController();
module.exports = adminCourseWebController;
