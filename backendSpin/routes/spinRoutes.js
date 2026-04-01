const express = require("express");
const router = express.Router();
const spinController = require("../controllers/spinController");
const antiFraude = require("../middleware/antiFraude");

// Route: POST /api/spin
// 1. Anti-fraude thabet fil numéro
// 2. Controller i-calculi el rbe7 w i-sajel fil Google Sheets
router.post("/spin", antiFraude, spinController.handleSpin);
router.put("/update-prize", spinController.updatePrize);

module.exports = router;
