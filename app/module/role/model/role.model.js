// role.model.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      enum: ["student", "instructor", "admin"],
      default:"student"
    },
  },
  { versionKey: false, timestamps: true }
);

const RoleModel = mongoose.model("Role", roleSchema);
module.exports = RoleModel;