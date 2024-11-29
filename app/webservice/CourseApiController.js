const { default: mongoose } = require("mongoose");
const { CourseModel } = require("../module/admin/course/model/course.model");

class CourseApiController {
  // Create a new course
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
        lessons,
      } = req.body;

      const newCourse = new CourseModel({
        title,
        description,
        price,
        instructor,
        courseType,
        category,
        rating,
        lessons,
      });

      if (req.file) {
        newCourse.thumbnail = req.file.path;
      }
      await newCourse.save();

      return res.status(201).json({
        status: 201,
        message: `Course created successfully`,
        newCourse,
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Fetch all courses with lessons count using aggregation
  async getCourses(req, res) {
    try {
      const courses = await CourseModel.aggregate(
        [
        {
          $match: {
          status:"published"
        }
      },
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviewDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $addFields: {
            avgRating: {
              $round: [{ $avg: "$reviewDetails.rating" }, 0],
            },
            instructorName: {
              $concat: [
                {
                  $arrayElemAt: ["$instructorDetails.first_name", 0],
                },
                " ",
                {
                  $arrayElemAt: ["$instructorDetails.last_name", 0],
                },
              ],
            },
          },
        },
        {
          $project: {
            reviews: 0,
            projectDetails: 0,
            lessons: 0,
            certificates: 0,
            students: 0,
            instructor: 0,
            reviewDetails: 0,
            instructorDetails: 0,
          },
        },
        ]
      );

      res.status(200).json({
        status: 200,
        message: "Courses fetched successfully",
        courses,
        total: courses.length,
      });
    } catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    }
  }
  async getCoursesForAdmin(req, res) {
    try {
      const courses = await CourseModel.aggregate([
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviewDetails",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $addFields: {
            avgRating: {
              $round: [{ $avg: "$reviewDetails.rating" }, 0],
            },
            categoryName: "$categoryDetails.name",
            instructorName: {
              $concat: [
                {
                  $arrayElemAt: ["$instructorDetails.first_name", 0],
                },
                " ",
                {
                  $arrayElemAt: ["$instructorDetails.last_name", 0],
                },
              ],
            },
          },
        },
        {
          $project: {
            reviews: 0,
            projectDetails: 0,
            lessons: 0,
            certificates: 0,
            students: 0,
            instructor: 0,
            reviewDetails: 0,
            instructorDetails: 0,
            categoryDetails: 0,
          },
        },
      ]);

      res.status(200).json({
        status: 200,
        message: "Courses fetched successfully",
        courses,
        total: courses.length,
      });
    } catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    }
  }
  async getCoursesForInstructors(req, res) {
    try {
      const id = req.params.id;
      const courses = await CourseModel.aggregate([
        {
          $match: {
            instructor: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviewDetails",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $addFields: {
            avgRating: {
              $round: [{ $avg: "$reviewDetails.rating" }, 0],
            },
            categoryName: "$categoryDetails.name",
            instructorName: {
              $concat: [
                {
                  $arrayElemAt: ["$instructorDetails.first_name", 0],
                },
                " ",
                {
                  $arrayElemAt: ["$instructorDetails.last_name", 0],
                },
              ],
            },
          },
        },
        {
          $project: {
            reviews: 0,
            projectDetails: 0,
            lessons: 0,
            certificates: 0,
            students: 0,
            instructor: 0,
            reviewDetails: 0,
            instructorDetails: 0,
            categoryDetails: 0,
          },
        },
      ]);

      res.status(200).json({
        status: 200,
        message: "Courses fetched successfully",
        courses,
        total: courses.length,
      });
    } catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Fetch course details with lessons and certificates
  async courseDetails(req, res) {
    try {
      const id = req.params.id;
      const courseDetails = await CourseModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "lessons",
            localField: "lessons",
            foreignField: "_id",
            pipeline: [
              {
                $lookup: {
                  from: "videos", // Replace "videos" with the collection you want to join
                  localField: "_id", // Field from "lessons" collection to join on
                  foreignField: "lesson", // Field from "videos" collection to match
                  as: "videoDetails",
                },
              },
              {
                $project: {
                  videos: 0,
                },
              },
            ],
            as: "lessonDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $addFields: {
            instructorName: {
              $concat: [
                {
                  $arrayElemAt: ["$instructorDetails.first_name", 0],
                },
                " ",
                {
                  $arrayElemAt: ["$instructorDetails.last_name", 0],
                },
              ],
            },
          },
        },
        {
          $project: {
            instructor: 0,
            category: 0,
            lessons: 0,
            "lessonDetails.course": 0,
            "lessonDetails.videoDetails.lesson": 0,
            "lessonDetails.videoDetails.completedBy": 0,
            instructorDetails: 0,
          },
        },
      ]);

      res.status(200).json({
        status: 200,
        message: "Course details fetched successfully",
        courseDetails: courseDetails[0] || null,
      });
    } catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Enroll a user in a course
  async enrolledInCourse(req, res) {
    try {
      const course = await CourseModel.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (!course.students.includes(req.user._id)) {
        course.students.push(req.user._id);
        await course.save();
      }
      return res.status(200).json({ message: "Enrolled successfully" });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Mark a video as completed
  async videosCompleted(req, res) {
    try {
      const course = await CourseModel.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const lesson = course.lessons.id(req.params.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      if (!lesson.completedBy.includes(req.user._id)) {
        lesson.completedBy.push(req.user._id);
        await course.save();
      }
      return res.status(200).json({ message: "Video marked as complete" });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  async filterByCategory(req, res) {
    try {
      const categoryParam = req.query.category;

      if (!categoryParam) {
        return res.status(400).json({
          message: "Category parameter is required",
        });
      }
      const categoryArray = categoryParam
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id.trim()));

      const filteredCourses = await CourseModel.aggregate([
        {
          $match: {
            category: {
              $in: categoryArray,
            },
          },
        },
        {
          $project: {
            reviews: 0,
            lessons: 0,
            certificates: 0,
            students: 0,
          },
        },
      ]);

      return res.status(200).json({
        message: "Data fetched successfully",
        totalCount: filteredCourses.length,
        data: filteredCourses,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while fetching data",
        error: error,
      });
    }
  }

  async filterByInstructor(req, res) {
    try {
      const instructorParam = req.query.instructor;

      if (!instructorParam) {
        return res.status(400).json({
          message: "instructor parameter is required",
        });
      }
      const instructorArray = instructorParam
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id.trim()));

      const filteredInstructors = await CourseModel.aggregate([
        {
          $match: {
            instructor: {
              $in: instructorArray,
            },
          },
        },
        {
          $project: {
            reviews: 0,
            lessons: 0,
            certificates: 0,
            students: 0,
          },
        },
      ]);

      return res.status(200).json({
        message: "Data fetched successfully",
        totalCount: filteredInstructors.length,
        data: filteredInstructors,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while fetching data",
        error: error,
      });
    }
  }

  async searchCourses(req, res) {
    try {
      const query = {};

      // Title search (case insensitive)
      if (req.query.title) {
        query.title = { $regex: req.query.title, $options: "i" };
      }

      // Price filter
      if (req.query.price) {
        query.price = parseFloat(req.query.price);
      }

      // Category filter (validate if it's a valid ObjectId)
      if (req.query.category && mongoose.isValidObjectId(req.query.category)) {
        query.category = mongoose.Types.ObjectId(req.query.category);
      }

      // Instructor filter (validate if it's a valid ObjectId)
      if (
        req.query.instructor &&
        mongoose.isValidObjectId(req.query.instructor)
      ) {
        query.instructor = mongoose.Types.ObjectId(req.query.instructor);
      }

      // Description search (case insensitive)
      if (req.query.description) {
        query.description = { $regex: req.query.description, $options: "i" };
      }

      // Fetch results from the database
      const result = await CourseModel.find(query);

      // Check if no results found
      if (!result || result.length === 0) {
        console.log("No courses found with the given criteria");
        return res.status(404).json({ message: "No courses found" });
      }

      // Return the search results
      res.status(200).json(result);
    } catch (error) {
      console.error("Error while searching for courses:", error);
      res
        .status(500)
        .json({ error: "An error occurred while searching for courses" });
    }
  }
  async getCourses(req, res) {
    try {
      const courses = await CourseModel.aggregate([
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviewDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $addFields: {
            avgRating: {
              $round: [{ $avg: "$reviewDetails.rating" }, 0],
            },
            instructorName: {
              $concat: [
                {
                  $arrayElemAt: ["$instructorDetails.first_name", 0],
                },
                " ",
                {
                  $arrayElemAt: ["$instructorDetails.last_name", 0],
                },
              ],
            },
          },
        },
        {
          $project: {
            reviews: 0,
            projectDetails: 0,
            lessons: 0,
            certificates: 0,
            students: 0,
            instructor: 0,
            reviewDetails: 0,
            instructorDetails: 0,
          },
        },
      ]);

      res.status(200).json({
        status: 200,
        message: "Courses fetched successfully",
        courses,
        total: courses.length,
      });
    } catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    }
  }
}

module.exports = new CourseApiController();
