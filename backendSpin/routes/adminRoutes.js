// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/participants", adminController.getLeads);
router.delete("/delete/:id", adminController.removeLead);// نزيدو هنا الـ Route متاع تحديث الجوائز لاحقاً
router.get("/dashboard", adminController.getDashboardStats);
router.post("/login", adminController.login); // 👈 الـ Route الجديد متع الـ Login
router.post("/signup", adminController.signup); // 👈 هذي اللي حاجتنا بيها للـ Postman

module.exports = router;
