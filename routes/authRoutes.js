const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const User = require("../models/User");


// ---------------- SIGNUP ----------------

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hash,
      role
    });

    res.json({ success: true, message: "Signup successful" });

  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err.message });
  }
});


// ---------------- LOGIN (STEP 1) ----------------

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Wrong password" });

    // 🔐 if 2FA enabled → ask OTP
    if (user.twoFAEnabled) {
      return res.json({
        require2FA: true,
        email: user.email
      });
    }

    // ✅ normal login (no 2FA yet)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ success: true, token, role: user.role });

  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});


// ---------------- 2FA SETUP ----------------

router.post("/2fa/setup", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  const secret = speakeasy.generateSecret({
    name: `EvidenceSystem (${email})`
  });

  user.twoFASecret = secret.base32;
  await user.save();

  const qr = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    qr,
    secret: secret.base32
  });
});


// ---------------- 2FA VERIFY ENABLE ----------------

router.post("/2fa/verify", async (req, res) => {
  const { email, token } = req.body;

  const user = await User.findOne({ email });

  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: "base32",
    token
  });

  if (!verified)
    return res.status(400).json({ message: "Invalid OTP" });

  user.twoFAEnabled = true;
  await user.save();

  res.json({ message: "2FA enabled successfully" });
});


// ---------------- LOGIN STEP 2 (OTP VERIFY) ----------------

router.post("/login-2fa", async (req, res) => {
  const { email, token } = req.body;

  const user = await User.findOne({ email });

  const ok = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: "base32",
    token
  });

  if (!ok)
    return res.status(400).json({ message: "Invalid OTP" });

  const authToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({
    success: true,
    token: authToken,
    role: user.role
  });
});

module.exports = router;
