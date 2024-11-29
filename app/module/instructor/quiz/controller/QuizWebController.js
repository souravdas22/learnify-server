const { default: mongoose } = require("mongoose");
const { CourseModel } = require("../../../admin/course/model/course.model");
const QuizModel = require("../../../admin/quiz/model/quiz.model");
const UserModel = require("../../../admin/auth/model/user.model");

class InstructorQuizWebController {
  async list(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      res.render("instructor/quiz/list.ejs", {
        title: "instructor Courses",
        user
      });
    } catch (err) {
      console.log(err);
    }
  }

  async activeCourse(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      const courses = await CourseModel.find();
      
      res.render("instructor/quiz/active-course.ejs", {
        title: "instructor Courses",
        courses,
        user
      });
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).render("error", {
        message: "An error occurred while fetching courses.",
      });
    }
  }

  async add(req, res) {
    try {
      const lessonId = req.params.lessonId;
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      res.render("instructor/quiz/add.ejs", {
        title: "instructor Courses",
        lessonId,
        user
      });
    } catch (err) {
      console.log(err);
    }
  }

  async lessonQuizzes(req, res) {
    try {
      const lessonId = req.params.lessonId;
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      const quizzes = await QuizModel.aggregate([
        { $match: { lesson: new mongoose.Types.ObjectId(lessonId) } },
      ]);

      res.render("instructor/quiz/quiz-details.ejs", {
        title: "instructor Quizzes",
        quizzes,
        lessonId,
        user
      });
    } catch (err) {
      console.log(err);
    }
  }
  async edit(req, res) {
    try {
      const quizId = req.params.quizId;
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      const quiz = await QuizModel.findById(quizId);

      if (!quiz) {
        return res.status(404).send("Quiz not found");
      }

      res.render("instructor/quiz/edit.ejs", {
        title: "Edit Quiz",
        quiz: quiz,
        user
      });
    } catch (err) {
      console.error("Error loading quiz:", err);
      res.status(500).send("An error occurred while loading the quiz.");
    }
  }

  async updateQuiz(req, res) {
    try {
      const quizId = req.params.quizId;
      const { title, description, questions } = req.body;

      // Ensure `questions` is defined and is an array
      const formattedQuestions = Array.isArray(questions)
        ? questions.map((question) => ({
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
          }))
        : [];

      // Find and update the quiz
      const updatedQuiz = await QuizModel.findByIdAndUpdate(
        quizId,
        {
          title,
          description,
          questions: formattedQuestions,
        },
        { new: true }
      );

      if (!updatedQuiz) {
        return res.status(404).send("Quiz not found");
      }

      res.redirect(`/instructor/lesson/${updatedQuiz.lesson}/quizzes`);
    } catch (err) {
      console.error("Error updating quiz:", err);
      res.status(500).send("An error occurred while updating the quiz.");
    }
  }

  // Method to delete an entire quiz by its ID
  async deleteQuiz(req, res) {
    try {
      const quizId = req.params.quizId;
      const result = await QuizModel.findByIdAndDelete(quizId);

      if (!result) {
        res.redirect("/instructor/lesson/67358cfa62dd44af219cfaa9/quizzes");
        return res.status(404).render("instructor/quiz/list.ejs", {
          title: "instructor Courses",
          message: "Quiz not found",
          messageType: "error",
        });
      }

      res.status(200).render("instructor/quiz/list.ejs", {
        title: "instructor Courses",
        message: "Quiz deleted successfully",
        messageType: "success",
      });
    } catch (err) {
      console.error("Error deleting quiz:", err);
      res.status(500).render("instructor/quiz/list.ejs", {
        title: "instructor Courses",
        message: "An error occurred while deleting the quiz.",
        messageType: "error",
      });
    }
  }

  // Method to delete a specific question within a quiz by quiz ID and question index
  async deleteQuestion(req, res) {
    try {
      const quizId = req.params.quizId;
      const questionIndex = parseInt(req.params.questionIndex);

      const updatedQuiz = await QuizModel.findByIdAndUpdate(
        quizId,
        { $unset: { [`questions.${questionIndex}`]: 1 } },
        { new: true }
      );

      if (updatedQuiz) {
        updatedQuiz.questions = updatedQuiz.questions.filter((q) => q !== null);
        await updatedQuiz.save();
      } else {
        return res.status(404).render("instructor/quiz/quiz-details.ejs", {
          title: "instructor Quizzes",
          message: "Quiz or question not found",
          messageType: "error",
        });
      }

      res.status(200).render("admin/quiz/quiz-details.ejs", {
        title: "Admin Quizzes",
        lessonId: updatedQuiz.lesson,
        quizzes: [updatedQuiz],
        message: "Question deleted successfully",
        messageType: "success",
      });
    } catch (err) {
      console.error("Error deleting question:", err);
      res.status(500).render("admin/quiz/quiz-details.ejs", {
        title: "Admin Quizzes",
        message: "An error occurred while deleting the question.",
        messageType: "error",
      });
    }
  }
}

const instructorQuizWebController = new InstructorQuizWebController();
module.exports = instructorQuizWebController;
