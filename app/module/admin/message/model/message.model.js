const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["unanswered", "answered"],
      default: "unanswered",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false, timestamps: true }
);

const MeessageModel = mongoose.model("Message", messageSchema);
module.exports = MeessageModel;
