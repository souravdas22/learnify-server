const { default: mongoose } = require("mongoose");
const VideoModel = require("../../../admin/video/model/video.model");
const CourseModel = require("../../../admin/course/model/course.model");
const UserModel = require("../../../admin/auth/model/user.model");

class InstructorVideoWebController {
  async getVideos(req, res) {
    try {
      const id = req.params.lessonId;
        const _id = req.instructor._id;
        const user = await UserModel.findOne({ _id });
      const videos = await VideoModel.aggregate([
        {
          $match: {
            lesson: new mongoose.Types.ObjectId(id),
          },
        },
      ]);
      res.render("instructor/video/list.ejs", {
        videos: videos,
        lessonId: id,
        title: "videos",
        user
      });
    } catch (err) {
        res.redirect(`/instructor/course/${id}/videos`);
        console.log(`Error in getting videos ${err}`)

    }
  }
  async createVideo(req, res) {
    try {
      const courseId = req.params.courseId;
      const videoPath = req.file ? req.file.path : null;

      if (!videoPath) {
        console.log("Video file is required");
      }
      const { title, duration } = req.body;
      const newVideo = new VideoModel({
        title,
        url: videoPath,
        duration,
        course: courseId,
      });
      await newVideo.save();

      await CourseModel.findByIdAndUpdate(courseId, {
        $push: { videos: newVideo._id },
      });
      res.redirect(`/instructor/course/${courseId}/videos`);
    } catch (err) {
      res.redirect(`/instructor/course/${courseId}/videos`);
      console.log(`Error create video ${err}`);
    }
  }
}
const instructorVideoWebController = new InstructorVideoWebController();
module.exports = instructorVideoWebController;
