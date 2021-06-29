const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  permission: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PhysicalProfile",
  },
  diet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Diet",
  },
});
module.exports = mongoose.model("User", UserSchema);
