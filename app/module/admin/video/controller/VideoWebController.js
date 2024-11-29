const { default: mongoose } = require("mongoose");
const VideoModel = require("../model/video.model");
const UserModel = require("../../auth/model/user.model");
const lessonModel = require("../../lesson/model/lesson.model");

class AdminVideoWebController {
  async getVideos(req, res) {
    try {
      const _id = req.admin._id;
       const user = await UserModel.findOne({ _id });
      const videos = await VideoModel.aggregate([
        {
          $match: {
            lesson: new mongoose.Types.ObjectId(req.params.lessonId),
          },
        },
      ]);
      console.log(req.params.lessonId,"get videos")
      res.render("admin/video/list.ejs", {
        videos: videos,
        lessonId: req.params.lessonId,
        user: user,
        title: "videos",
      });
    } catch (err) {
        // res.redirect(`/admin/course/lesson/${id}/videos`);
        console.log(`Error in getting videos ${err}`)

    }
  }
  async createVideo(req, res) {
    try {
      const { title, duration, lessonId } = req.body;
      const videoPath = req.file ? req.file.path : null;
        if (!videoPath) {
          console.log("Video file is required");
        }
      const newVideo = new VideoModel({
        title,
        url: videoPath,
        duration,
        lesson: lessonId,
      });
      await newVideo.save();

      await lessonModel.findByIdAndUpdate(lessonId, {
        $push: { videos: newVideo._id },
      });
      res.redirect(`/admin/course/lesson/${lessonId}/videos`);
    } catch (err) {
      res.redirect(`/admin/course/lesson/${lessonId}/videos`);
      console.log(`Error create video ${err}`);
    }
  }
}
const adminVideoWebController = new AdminVideoWebController();
module.exports = adminVideoWebController;
