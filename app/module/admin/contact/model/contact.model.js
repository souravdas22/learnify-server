const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const ContactModel = mongoose.model("Contact", contactSchema);
module.exports = ContactModel;
