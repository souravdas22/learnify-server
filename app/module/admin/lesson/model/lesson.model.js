const mongoose = require("mongoose");
const lessonSchema = new mongoose.Schema(
  {
    title: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  },
  { versionKey: false, timestamps: true }
);
const lessonModel = mongoose.model("Lesson", lessonSchema);
module.exports = lessonModel;
