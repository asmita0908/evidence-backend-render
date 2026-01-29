const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

app.use("/api", require("./routes/auth"));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server started")
);
