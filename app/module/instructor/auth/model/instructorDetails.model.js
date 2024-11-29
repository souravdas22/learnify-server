const { default: mongoose } = require("mongoose");

const instructorDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bio: String,
  expertise: String,
});
const InstructorDetailsModel = mongoose.model(
  "InstructorDetails",
  instructorDetailsSchema
);
module.exports = InstructorDetailsModel;
