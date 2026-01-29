const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "viewer" },

  twoFASecret: String,
  twoFAEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
