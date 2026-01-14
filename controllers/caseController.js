const Case = require("../models/Case");

exports.createCase = async (req, res) => {
  const newCase = await Case.create(req.body);
  res.json(newCase);
};

exports.getCases = async (req, res) => {
  const cases = await Case.find();
  res.json(cases);
};
