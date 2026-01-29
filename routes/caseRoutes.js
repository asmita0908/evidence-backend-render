const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");

const { web3, contract } = require("../blockchain");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req,res)=>{

  try {

    const fileBuffer = req.file.buffer;

    // 🔐 generate hash
    const hash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // ⛓️ blockchain store
    const accounts = await web3.eth.getAccounts();

    const tx = await contract.methods
      .storeEvidence(hash)
      .send({
        from: accounts[0],
        gas: 300000
      });

    res.json({
      success: true,
      fileHash: hash,
      txHash: tx.transactionHash
    });

  } catch(err){
    console.error(err);
    res.status(500).json({message:"Upload blockchain error"});
  }

});

module.exports = router;
