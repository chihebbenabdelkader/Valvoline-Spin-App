const mongoose = require("mongoose");

const prizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: false },
    stockInitial: { type: Number, required: true, default: 0 },
    stockRestant: { type: Number, required: true, default: 0 }, // 👈 Zidna hedhi
    // ⬇️ الحوايج الجدد متع اللوجيك الذكي ⬇️
    maxParJour: { type: Number, default: null }, // قداش ماكسيموم يخرجو في النهار (كان null معناها ما فماش ليميت)
    heureDebut: { type: String, default: null }, // وقت البداية (مثال: "14:00")
    heureFin: { type: String, default: null }, // وقت النهاية (مثال: "18:00")
    dateSpecifique: { type: String, default: null }, // نهار معين (مثال: "2026-04-15" - للكادو الكبير)
  },
  { timestamps: true },
);

module.exports = mongoose.model("Prize", prizeSchema);
