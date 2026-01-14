const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  caseNumber: String,
  criminalName: String,
  caseType: String,
  place: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Case", caseSchema);
