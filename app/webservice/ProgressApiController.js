const { default: mongoose } = require("mongoose");
const lessonModel = require("../module/admin/lesson/model/lesson.model");
const ProgressModel = require("../module/admin/progress/model/progress.model");
const QuizModel = require("../module/admin/quiz/model/quiz.model");

class ProgressController {
  async markVideoCompleted(req, res) {
    try {
      const { userId, courseId, lessonId, videoId } = req.body;
      let progress = await ProgressModel.findOne({
        user: userId,
        course: courseId,
      });
      if (!progress) {
        progress = new ProgressModel({
          user: userId,
          course: courseId,
          completedLessons: [],
          completedVideos: [],
        });
      }

      if (!progress.completedVideos.includes(videoId)) {
        progress.completedVideos.push(videoId);
      }

      // list of videos in the lesson
      const lesson = await lessonModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(lessonId) } },
        { $project: { videos: 1 } },
      ]);

      if (!lesson || lesson.length === 0) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Check if all videos in the lesson are completed
      const allVideosCompleted = lesson[0].videos.every((video) =>
        progress.completedVideos.includes(video.toString())
      );

      if (allVideosCompleted && !progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      // Check if all lessons in the course are completed
      const courseLessons = await lessonModel.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        { $group: { _id: "$course", lessonIds: { $push: "$_id" } } },
        { $project: { lessonIds: 1 } },
      ]);

      const allLessonsCompleted =
        courseLessons.length > 0 &&
        courseLessons[0].lessonIds.every((lessonId) =>
          progress.completedLessons.includes(lessonId.toString())
        );

      //  mark course completion
      if (allLessonsCompleted) {
        progress.completedAt = new Date();
        progress.certified = true;
      }
      await progress.save();
      res.status(200).json({
        message: "Video marked as completed",
        progress,
      });
    } catch (error) {
      console.error("Error marking video as completed:", error);
      res.status(500).json({ message: `Internal server error ${error}` });
    }
  }
  async getCourseProgress(req, res) {
    const { userId, courseId } = req.params;

    try {
      const progress = await ProgressModel.findOne({
        user: userId,
        course: courseId,
      });
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }

      const courseLessons = await lessonModel.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
          },
        },
      
        {
          $project: {
            _id: 1,
            videos: {
              $map: { input: "$videos", as: "video", in: "$$video._id" },
            },
          },
        },
      ]);

      const allLessons = courseLessons.map((lesson) => lesson._id);
      const allVideos = courseLessons.flatMap((lesson) => lesson.videos);

      const completedLessons = progress.completedLessons;
      const completedVideos = progress.completedVideos;

      const completedLessonsCount = completedLessons.length;
      const completedVideosCount = completedVideos.length;
      const totalLessonsCount = allLessons.length;
      const totalVideosCount = allVideos.length;

      const courseCompletionPercentage = totalVideosCount
        ? Math.round((completedVideosCount / totalVideosCount) * 100)
        : 1;

      res.status(200).json({
        courseId,
        userId,
        completedLessonsCount,
        completedVideosCount,
        totalLessonsCount,
        totalVideosCount,
        completedLessons,
        completedVideos,
        courseCompletionPercentage,
      });
    } catch (error) {
      console.error("Error fetching course progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateQuizScore(req, res) {
    const { userId, courseId, quizId, userAnswers } = req.body;

    try {
      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const totalQuestions = quiz.questions.length;
      let correctAnswers = 0;

      quiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const totalMarks = totalQuestions; 
      const obtainedMarks = correctAnswers;
      const passingMarks = Math.ceil(totalQuestions * 0.5); 
      const status = obtainedMarks >= passingMarks ? "Pass" : "Fail";

      let progress = await ProgressModel.findOne({
        user: userId,
        course: courseId,
      });
      if (!progress) {
        progress = new ProgressModel({
          user: userId,
          course: courseId,
          quizScores: [{ quiz: quizId, score: obtainedMarks }],
        });
      } else {
        const existingQuiz = progress.quizScores.find(
          (quizScore) => quizScore.quiz.toString() === quizId.toString()
        );
        if (existingQuiz) {
          existingQuiz.score = obtainedMarks;
        } else {
          progress.quizScores.push({ quiz: quizId, score: obtainedMarks });
        }
      }

      await progress.save();

      res.status(200).json({
        totalQuestions,
        correctAnswers,
        totalMarks,
        obtainedMarks,
        status,
      });
    } catch (error) {
      console.error("Error updating quiz score:", error);
      res
        .status(500)
        .json({ message: `Internal server error ${error.message}` });
    }
  }
}

const progressApiController = new ProgressController();
module.exports = progressApiController;
