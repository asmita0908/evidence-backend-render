const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();


// ---------- CORS (Vercel allow) ----------

app.use(cors({
  origin: [
    "https://evidence-frontend-beta.vercel.app/"
  ],
  credentials: true
}));


// ---------- MIDDLEWARE ----------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ---------- ROUTES ----------

const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");

app.use("/api", authRoutes);
app.use("/api", caseRoutes);


// ---------- HEALTH CHECK ----------

app.get("/", (req, res) => {
  res.send("✅ Evidence Backend Running");
});


// ---------- DB CONNECT ----------

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB Connected");

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

})
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
});
