const { default: mongoose } = require("mongoose");
const { CourseModel } = require("../../../admin/course/model/course.model");
const UserModel = require("../../../admin/auth/model/user.model");

class InstructorReviewWebController {
  async getInstructorReviews(req, res) {
    try {
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      const reviews = await CourseModel.aggregate([
        {
          $match: {
            instructor: new mongoose.Types.ObjectId(_id),
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
          $unwind: {
            path: "$reviewDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "reviewDetails.userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: "$instructor",
            reviews: {
              $push: {
                review: "$reviewDetails",
                userEmail: "$userDetails.email",
                userProfile: "$userDetails.profilePicture",
                course: "$title",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            instructorId: "$_id",
            reviews: 1,
          },
        },
      ]);
      res.render("instructor/review/list.ejs", {
        title: "review list",
        reviews: reviews[0],
        user
      });
    } catch (error) {
      res.render("instructor/review/list.ejs");
    }
  }
}
const instructorReviewWebController = new InstructorReviewWebController();
module.exports = instructorReviewWebController;
