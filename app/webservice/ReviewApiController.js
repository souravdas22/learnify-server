const { CourseModel } = require("../module/admin/course/model/course.model");
const ReviewModel = require("../module/admin/review/model/review.model");
const mongoose = require("mongoose");
class ReviewApicontroller {
  async createReview(req, res) {
    try {
      const { courseId, userId, rating, comment } = req.body;

      const newReview = new ReviewModel({
        courseId,
        userId,
        rating,
        comment,
      });
      await newReview.save();

      await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $push: { reviews: newReview._id },
        },
        { new: true }
      );
      res
        .status(201)
        .json({ message: "Review created successfully", review: newReview });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating review", error: error.message });
    }
  }
  async getReviewsByCourse(req, res) {
    try {
      const { courseId } = req.params;
      const reviews = await ReviewModel.aggregate([
        { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            rating: 1,
            comment: 1,
            email: "$user.email",
            name: {
              $concat: ["$user.first_name", " ", "$user.last_name"],
            },
            profile: "$user.profilePicture",
            createdAt: 1,
          },
        },
      ]);

      res.status(200).json(reviews);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching reviews", error: error.message });
    }
  }

  async getAvgRating(req, res) {
    try {
      const id = req.params.id;
     const rating =  await ReviewModel.aggregate([
        {
          $match: { courseId: new mongoose.Types.ObjectId(id) },
        },
        {
          $group: {
            _id: "$courseId",
            averageRating: { $avg: "$rating" }, 
          },
        },
        {
          $project: {
            _id: 0,
            courseId: "$_id",
            averageRating: { $round: ["$averageRating", 0] },
          },
        },
      ]);
      res.status(200).json({status:200,rating})
    } catch (err) {
res.status(500).json({ message: "Error creating review", error: err });
    }
  }
}

const reviewApiController = new ReviewApicontroller();
module.exports = reviewApiController;
