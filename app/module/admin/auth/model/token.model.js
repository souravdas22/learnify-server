const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Date,
    default: () => Date.now() + 60 * 1000,
    index: { expires: "1m" },
  },
});
const TokenModel = mongoose.model("Token", tokenSchema);
module.exports = TokenModel;
