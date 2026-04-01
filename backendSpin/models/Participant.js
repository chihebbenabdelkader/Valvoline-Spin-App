const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    telephone: { type: String, required: true },
    magasin: { type: String, required: true },
    ville: { type: String, required: true },
    cadeau: { type: String, default: "En attente" },
  },
  { timestamps: true },
); // Hedhi tzid 'createdAt' w 'updatedAt' wa7adha

module.exports = mongoose.model("Participant", participantSchema);
