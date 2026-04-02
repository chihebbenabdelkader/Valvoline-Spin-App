const mongoose = require("mongoose");

const prizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: false },
    stockInitial: { type: Number, required: true, default: 0 },
    stockRestant: { type: Number, required: true, default: 0 },
    maxParJour: { type: Number, default: null },
    heureDebut: { type: String, default: null },
    heureFin: { type: String, default: null },
    // 👈 رديناه Array باش ياخذ برشا تواريخ
    dateSpecifique: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Prize", prizeSchema);
