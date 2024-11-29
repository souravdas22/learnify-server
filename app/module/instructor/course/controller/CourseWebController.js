const { default: mongoose } = require("mongoose");
const { CourseModel } = require("../../../admin/course/model/course.model");
const UserModel = require("../../../admin/auth/model/user.model");

class InstructorCourseWEbController {
  async list(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      res.render("instructor/course/list.ejs", {
        title: "instructor Courses",
        id: _id,
        user
      });
    } catch (err) {
      console.log(err);
    }
  }
  async addCourse(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      res.render("instructor/course/add.ejs", {
        title: "instructor Courses",
        user
      });
    } catch (err) {
      console.log(err);
    }
  }
  async updateCourse(req, res) {
    try {
      const id = req.params.id;
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      const course = await CourseModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
      ]);
      res.render("instructor/course/edit.ejs", {
        course: course[0],
        title: "edit course",
        user
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
      res.redirect("/instructor/courses");
      console.log(`Course created successfully`);
    } catch (err) {
      res.redirect("/instructor/course/create");
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
      res.redirect("/instructor/courses");
      console.log(`Course updated successfully`);
    } catch (err) {
      console.error("Error updating course:", err);
      res.redirect(`/instructor/course/update/${req.params.id}`);
    }
  }


}
const instructorCourseWEbController = new InstructorCourseWEbController();
module.exports = instructorCourseWEbController;
