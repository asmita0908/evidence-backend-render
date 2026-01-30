const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const Case = require("../models/Case");
const { logAction } = require("../utils/logger");
const { web3, contract } = require("../blockchain");


// ---------- MULTER MEMORY STORAGE ----------
const storage = multer.memoryStorage();
const upload = multer({ storage });


// =====================================================
// 🚀 UPLOAD CASE + STORE HASH ON BLOCKCHAIN
// =====================================================

router.post(
  "/upload",
  authMiddleware,
  roleMiddleware(["Admin", "Officer"]),
  upload.single("file"),

  async (req, res) => {

    try {

      // ---------- FILE CHECK ----------
      if (!req.file) {
        return res.status(400).json({
          message: "File required"
        });
      }

      const fileBuffer = req.file.buffer;

      // ---------- HASH ----------
      const hash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");


      // ---------- BLOCKCHAIN STORE ----------
      const accounts = await web3.eth.getAccounts();

      const tx = await contract.methods
        .storeEvidence(hash)
        .send({
          from: accounts[0],
          gas: 300000
        });


      // ---------- SAVE CASE IN DB ----------
      const newCase = await Case.create({

        caseNumber: req.body.caseNumber,
        caseType: req.body.caseType,
        criminalName: req.body.criminalName,
        dateTime: req.body.dateTime,
        location: req.body.location,
        description: req.body.description,

        fileHash: hash,
        blockchainTx: tx.transactionHash,

        uploadedBy: req.user.id
      });


      // ---------- AUDIT LOG ----------
      await logAction(
        req.user.id,
        req.user.role,
        "UPLOAD_CASE",
        newCase._id
      );


      // ---------- RESPONSE ----------
      res.json({
        success: true,
        message: "Evidence uploaded + blockchain stored",
        caseId: newCase._id,
        fileHash: hash,
        txHash: tx.transactionHash
      });

    }

    catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Upload blockchain error"
      });
    }

  }
);

module.exports = router;
