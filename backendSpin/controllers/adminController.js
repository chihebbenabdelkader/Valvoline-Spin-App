const Participant = require("../models/Participant");

exports.getLeads = async (req, res) => {
  try {
    // Njibou l participants lkol w nratbouhom mel jdid lel 9dim (-1)
    const participants = await Participant.find().sort({ createdAt: -1 });
    res.json({ success: true, data: participants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeLead = async (req, res) => {
  try {
    const { id } = req.params; // Tawa wallina nekhdmou b l'ID mta3 Mongo
    await Participant.findByIdAndDelete(id);
    res.json({ success: true, message: "تم الحذف بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
