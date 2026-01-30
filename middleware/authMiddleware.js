const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  // 🔐 Bearer token split
  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token format invalid" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } 
  catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
