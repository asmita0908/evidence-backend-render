const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  user:String,
  role:String,
  action:String,
  caseId:String,
  time:{type:Date,default:Date.now}
});

module.exports = mongoose.model("AuditLog", schema);
