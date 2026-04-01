const Participant = require("../models/Participant");
const Prize = require("../models/Prize"); // <--- هذي مهمة برشا

// 1. تسجيل البيانات الأولية
exports.handleSpin = async (req, res) => {
  try {
    const { nom, telephone, magasin, ville, giftName } = req.body;

    const newParticipant = await Participant.create({
      nom,
      telephone,
      magasin,
      ville,
      cadeau: giftName || "En attente",
    });

    res.json({
      success: true,
      message: "Data saved successfully",
      participantId: newParticipant._id,
    });
  } catch (error) {
    console.error("Erreur Handle Spin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. تحديث الكادو بعد ما تاقف العجلة
// 2. تحديث الكادو بعد ما تاقف العجلة
exports.updatePrize = async (req, res) => {
  try {
    // 👈 التغيير 1: استقبلنا الـ giftId
    const { participantId, giftName, giftId } = req.body;

    if (!participantId) {
      return res.status(400).json({ success: false, message: "ID manquant" });
    }

    // 1. نبدلو الكادو للـ Participant (هذي تخدم عندك مريڨلة)
    await Participant.findByIdAndUpdate(
      participantId,
      { cadeau: giftName },
      { new: true },
    );

    // 2. 🚨 التغيير 2: نقصو الستوك باستعمال الـ ID (مضمونة 100%)
    if (giftId && !giftId.toString().startsWith("tirage")) {
      const updatedPrize = await Prize.findOneAndUpdate(
        { _id: giftId, stockRestant: { $gt: 0 } }, // 👈 نلوجو بالـ ID
        { $inc: { stockRestant: -1 } },
        { new: true }, 
      );

      // ميساج للـ Terminal باش تثبت اللي هي خدمت
      if (!updatedPrize) {
        console.log(`⚠️ تنبيه: لم يتم إنقاص الستوك للكادو (ربما نفذ المخزون).`);
      } else {
        console.log(`✅ الستوك تنقص بنجاح للكادو: ${updatedPrize.name}. الباقي: ${updatedPrize.stockRestant}`);
      }
    }

    res.json({ success: true, message: "Prize updated and stock decremented" });
  } catch (error) {
    console.error("Erreur Update Prize:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
