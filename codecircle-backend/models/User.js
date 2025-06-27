const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  realName: String,
  avatar: String,
  ranking: Number,
  easySolved: Number,
  mediumSolved: Number,
  hardSolved: Number,
  submissionCalendar: { type: Map, of: Number }
});

module.exports = mongoose.model("User", userSchema);
