// routes/prizeRoutes.js
const express = require("express");
const router = express.Router();
const prizeController = require("../controllers/prizeController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. Nthabtou elli l dossier uploads/prizes mawjoud (Ken le, nasn3ouh)
const dir = "./uploads/prizes";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// 2. Config Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "prize-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// 3. Les Routes
router.get("/", prizeController.getAllPrizes);
// n-uploadiw taswira wa7da esmha 'image'
router.post("/add", upload.single("image"), prizeController.createPrize);
router.put("/update/:id", upload.single("image"), prizeController.updatePrize);
router.delete("/delete/:id", prizeController.deletePrize);

module.exports = router;
