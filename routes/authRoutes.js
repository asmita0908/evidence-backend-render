const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const User = require("../models/User");


// ================= SIGNUP =================

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hash,
      role
    });

    res.json({ success: true, message: "Signup successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup error", error: err.message });
  }
});


// ================= LOGIN STEP 1 =================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: "Wrong password" });

    // 🔐 If 2FA enabled → ask OTP
    if (user.twoFAEnabled) {
      return res.json({
        require2FA: true,
        email: user.email
      });
    }

    // ✅ Normal login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token, role: user.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});


// ================= 2FA SETUP =================

router.post("/2fa/setup", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

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

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "2FA setup error" });
  }
});


// ================= 2FA VERIFY ENABLE =================

router.post("/2fa/verify", async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.twoFASecret)
      return res.status(400).json({ message: "2FA not setup" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
      window: 1
    });

    if (!verified)
      return res.status(400).json({ message: "Invalid OTP" });

    user.twoFAEnabled = true;
    await user.save();

    res.json({ message: "2FA enabled successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "2FA verify error" });
  }
});


// ================= LOGIN STEP 2 (OTP LOGIN) =================

router.post("/login-2fa", async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const ok = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
      window: 1
    });

    if (!ok)
      return res.status(400).json({ message: "Invalid OTP" });

    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token: authToken,
      role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "2FA login error" });
  }
});


module.exports = router;
