const { default: mongoose } = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    duration: {
      type: Number,
      required: true,
    },
    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { versionKey: false, timestamps: true }
);
const VideoModel = mongoose.model("Video", videoSchema);
module.exports = VideoModel;
