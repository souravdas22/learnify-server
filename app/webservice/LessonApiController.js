const mongoose = require("mongoose");
const LessonModel = require("../module/admin/lesson/model/lesson.model");
const { CourseModel } = require("../module/admin/course/model/course.model");

class LessonApiController {
  // Create a new lesson
  async createLesson(req, res) {
    try {
      const { title, course } = req.body;

      const newLesson = new LessonModel({
        title,
        course: course,
      });

      await newLesson.save();
      // Add the lesson to the course
      await CourseModel.findByIdAndUpdate(course, {
        $push: { lessons: newLesson._id },
      });

      return res.status(201).json({
        status: 201,
        message: `Lesson created successfully`,
        newLesson,
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Fetch all lessons with optional course filtering
  async getLessons(req, res) {
    try {
      const { courseId } = req.params;
      const lessons = await LessonModel.aggregate([
        {
          $match: {
            course: new mongoose.Types.ObjectId(courseId),
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videoDetails",
          },
        },
        {
          $unwind: {
            path: "$courseDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            __v: 0,
            videos: 0,
            course: 0,
            "videoDetails.lesson": 0,
            "videoDetails.completedBy": 0,
            quiz: 0,
          },
        },
      ]);

      res.status(200).json({
        status: 200,
        message: "Lessons fetched successfully",
        lessons,
        total: lessons.length,
      });
    } catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Get details for a specific lesson
  async lessonDetails(req, res) {
    try {
      const lessonId = req.params.id;

      const lessonDetails = await LessonModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(lessonId),
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $unwind: {
            path: "$courseDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      res.status(200).json({
        status: 200,
        message: "Lesson details fetched successfully",
        lessonDetails: lessonDetails[0] || null,
      });
    } catch (err) {
      res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Update lesson details
  async updateLesson(req, res) {
    try {
      const lessonId = req.params.id;
      const updateData = req.body;

      const updatedLesson = await LessonModel.findByIdAndUpdate(
        lessonId,
        updateData,
        { new: true }
      );

      if (!updatedLesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      return res.status(200).json({
        status: 200,
        message: "Lesson updated successfully",
        updatedLesson,
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Delete a lesson and remove it from the course
  async deleteLesson(req, res) {
    try {
      const lessonId = req.params.id;

      const lesson = await LessonModel.findByIdAndDelete(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Remove the lesson from the course
      await CourseModel.findByIdAndUpdate(lesson.course, {
        $pull: { lessons: lessonId },
      });

      return res.status(200).json({
        status: 200,
        message: "Lesson deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Mark lesson as completed by user
  async markLessonComplete(req, res) {
    try {
      const lessonId = req.params.id;
      const userId = req.user._id;

      const lesson = await LessonModel.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      if (!lesson.completedBy.includes(userId)) {
        lesson.completedBy.push(userId);
        await lesson.save();
      }

      return res.status(200).json({ message: "Lesson marked as complete" });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }
}

module.exports = new LessonApiController();
