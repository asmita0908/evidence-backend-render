const router = require("express").Router();
const { createCase, getCases } = require("../controllers/caseController");

// Create new case
router.post("/", createCase);

// Get all cases
router.get("/", getCases);

module.exports = router;
