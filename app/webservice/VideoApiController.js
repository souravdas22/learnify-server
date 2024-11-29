const mongoose = require("mongoose");
const VideoModel = require("../module/admin/video/model/video.model");
const LessonModel = require("../module/admin/lesson/model/lesson.model");

class VideoApiController {
  // Create a new video and associate it with a lesson
  async createVideo(req, res) {
    try {
      const lessonId = req.params.lessonId;
      const videoPath = req.file ? req.file.path : null;

      if (!videoPath) {
        return res.status(400).json({
          message: "Video file is required",
        });
      }

      const { title, duration } = req.body;
      const newVideo = new VideoModel({
        title,
        url: videoPath,
        duration,
        lesson: lessonId,
      });

      await newVideo.save();

      // Add the video to the lesson
      await LessonModel.findByIdAndUpdate(lessonId, {
        $push: { videos: newVideo._id },
      });

      return res.status(201).json({
        status: 201,
        message: "Video created successfully",
        newVideo,
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Fetch all videos
  async getVideos(req, res) {
    try {
      const videos = await VideoModel.find();
      res.status(200).json({
        status: 200,
        message: "Videos fetched successfully",
        videos,
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Fetch all videos for a specific lesson
  async getLessonVideos(req, res) {
    try {
      const lessonId = req.params.lessonId;
      const videos = await VideoModel.find({ lesson: lessonId });

      res.status(200).json({
        status: 200,
        message: "Lesson videos fetched successfully",
        data: videos,
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Get details for a specific video
  async getVideoDetails(req, res) {
    try {
      const videoId = new mongoose.Types.ObjectId(req.params.id);
      const videoDetails = await VideoModel.aggregate([
        {
          $match: { _id: videoId },
        },
        {
          $lookup: {
            from: "lessons",
            localField: "lesson",
            foreignField: "_id",
            as: "lessonDetails",
          },
        },
        {
          $unwind: {
            path: "$lessonDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            url: 1,
            description: 1,
            "lessonDetails.title": 1, 
          },
        },
      ]);

      if (!videoDetails || videoDetails.length === 0) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Video details fetched successfully",
        data: videoDetails[0], 
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }
  // Update video details
  async updateVideo(req, res) {
    try {
      const videoId = req.params.id;
      const updateData = req.body;

      const updatedVideo = await VideoModel.findByIdAndUpdate(
        videoId,
        updateData,
        { new: true }
      );

      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Video updated successfully",
        data: updatedVideo,
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Delete a video and remove it from the lesson
  async deleteVideo(req, res) {
    try {
      const videoId = req.params.id;

      const video = await VideoModel.findByIdAndDelete(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Remove the video from the lesson
      await LessonModel.findByIdAndUpdate(video.lesson, {
        $pull: { videos: videoId },
      });

      res.status(200).json({
        status: 200,
        message: "Video deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }

  // Mark video as completed by a user
  async markVideoComplete(req, res) {
    try {
      const videoId = req.params.id;
      const userId = req.user._id;

      const video = await VideoModel.findById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (!video.completedBy.includes(userId)) {
        video.completedBy.push(userId);
        await video.save();
      }

      res.status(200).json({ message: "Video marked as complete" });
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  }
}

module.exports = new VideoApiController();
