const path = require("path");
const multer = require("multer");

// Map for allowed video file types
const VIDEO_TYPE_MAP = {
  "video/mp4": "mp4",
  "video/mkv": "mkv",
  "video/avi": "avi",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = VIDEO_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid video type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "uploads/videos");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = VIDEO_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadVideo = multer({ storage: storage });

module.exports = uploadVideo;
