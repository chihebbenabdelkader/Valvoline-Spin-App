// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/participants", adminController.getLeads);
router.delete("/delete/:id", adminController.removeLead);// نزيدو هنا الـ Route متاع تحديث الجوائز لاحقاً

module.exports = router;
