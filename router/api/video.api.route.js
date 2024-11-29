const express = require("express");
const videoApiController = require("../../app/webservice/VideoApiController");
const uploadVideo = require("../../app/helper/courseVideoUpload");
const { AuthCheck } = require("../../app/middleware/authHelper");

const videoRouter = express.Router();

// Route to create a video for a specific lesson
videoRouter.post(
  "/api/lesson/:lessonId/video",
  uploadVideo.single("url"),
  AuthCheck,
  videoApiController.createVideo
);

// Route to get all videos
videoRouter.get("/api/videos", AuthCheck, videoApiController.getVideos);

// Route to get all videos for a specific lesson
videoRouter.get(
  "/api/lesson/:lessonId/videos",
  AuthCheck,

  videoApiController.getLessonVideos
);

// Route to get details of a specific video
videoRouter.get(
  "/api/video/:id",
  AuthCheck,
  videoApiController.getVideoDetails
);

// Route to update a specific video
videoRouter.put("/api/video/:id", AuthCheck, videoApiController.updateVideo);

// Route to delete a specific video
videoRouter.delete("/api/video/:id", AuthCheck, videoApiController.deleteVideo);

// Route to mark a video as complete for the current user
videoRouter.post(
  "/api/video/:id/complete",
  AuthCheck,

  videoApiController.markVideoComplete
);

module.exports = (app) => {
  app.use(videoRouter);
};
