const { default: mongoose } = require("mongoose");
const QuizModel = require("../module/admin/quiz/model/quiz.model");
const lessonModel = require("../module/admin/lesson/model/lesson.model");
const ProgressModel = require("../module/admin/progress/model/progress.model");

class QuizApiController {
  // Create a new quiz
  async createQuiz(req, res) {
    try {
      const { lesson, description, questions } = req.body;
      const data = await QuizModel.create({
        lesson,
        description,
        questions,
      });
      const lessonRecord = await lessonModel.findById(lesson);
      if (!lessonRecord) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      await lessonModel.findByIdAndUpdate(lesson, {
        $push: { quiz: data._id },
      });

      res.status(201).json({
        status: 201,
        message: "Quiz created successfully",
        data,
      });
    } catch (err) {
      res.status(400).json({ message: `Error creating quiz: ${err.message}` });
    }
  }

  // Get all quizzes
  async getAllQuizzes(req, res) {
    try {
      const quizzes = await QuizModel.find({});
      res.status(200).json({
        status: 200,
        message: "Quizzes fetched successfully",
        quizzes,
        total: quizzes.length,
      });
    } catch (err) {
      res
        .status(400)
        .json({ message: `Error fetching quizzes: ${err.message}` });
    }
  }

  // Update an existing quiz

  async updateQuiz(req, res) {
    try {
      const quizId = req.params.id;
      const { lesson, description, questions } = req.body;

      const updatedQuiz = await QuizModel.findByIdAndUpdate(
        quizId,
        { lesson, description, questions },
        { new: true }
      );

      if (!updatedQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Quiz updated successfully",
        updatedQuiz,
      });
    } catch (err) {
      res.status(400).json({ message: `Error updating quiz: ${err.message}` });
    }
  }

  // Delete a quiz
  async deleteQuiz(req, res) {
    try {
      const quizId = req.params.id;
      const deletedQuiz = await QuizModel.findByIdAndDelete(quizId);

      if (!deletedQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Quiz deleted successfully",
      });
    } catch (err) {
      res.status(400).json({ message: `Error deleting quiz: ${err.message}` });
    }
  }

  // List quizzes for a specific lesson
  async listQuizzes(req, res) {
    try {
      const lessonId = req.params.id;
      const quizzes = await QuizModel.find({ lesson: lessonId });

      res.status(200).json({
        status: 200,
        message: "Quizzes fetched successfully",
        quizzes,
      });
    } catch (err) {
      res
        .status(400)
        .json({ message: `Error fetching quizzes: ${err.message}` });
    }
  }

  async courseLessons(req, res) {
    try {
      const courseId = req.params.courseId;
      res.render("admin/quiz/lesson/list.ejs", { courseId: courseId });
    } catch (err) {}
  }
  // Answer a quiz
  async answerQuiz(req, res) {
    try {
      const quizId = req.params.id;
      const { answers } = req.body;

      // Fetch the quiz
      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Check answers and count correct responses
      let correctCount = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctCount++;
        }
      });

      res.status(200).json({
        status: 200,
        message: "Quiz answered successfully",
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
      });
    } catch (err) {
      res.status(400).json({ message: `Error answering quiz: ${err.message}` });
    }
  }
  async quizResults(req, res) {
    const { userId } = req.params;

    try {
      // Aggregation pipeline to get quiz results for the user
      const results = await ProgressModel.aggregate([
        {
          $match: { user: new mongoose.Types.ObjectId(userId) }, // Match the user's progress
        },
        {
          $unwind: "$quizScores", // Unwind the quizScores array to process each quiz separately
        },
        {
          $lookup: {
            from: "quizzes", // Name of the Quiz collection
            localField: "quizScores.quiz",
            foreignField: "_id",
            as: "quizDetails", // Add quiz details as 'quizDetails' field
          },
        },
        {
          $unwind: "$quizDetails", // Unwind the quizDetails array to get individual quiz
        },
        {
          $project: {
            quizId: "$quizScores.quiz",
            score: "$quizScores.score",
            totalQuestions: { $size: "$quizDetails.questions" }, // Get total number of questions
            quizDescription: "$quizDetails.description", // Get the description from quizDetails
          },
        },
        {
          $project: {
            quizId: 1,
            totalQuestions: 1,
            correctAnswers: "$score",
            quizDescription: 1, // Output the quiz description instead of username
          },
        },
      ]);

      res.status(200).json(results);
    } catch (error) {
      console.error("Error retrieving user quiz results:", error);
      res
        .status(500)
        .json({ message: `Internal server error: ${error.message}` });
    }
  }
}

const quizApiController = new QuizApiController();
module.exports = quizApiController;
