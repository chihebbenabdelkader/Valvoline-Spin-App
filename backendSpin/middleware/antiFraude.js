const Participant = require("../models/Participant");

const antiFraude = async (req, res, next) => {
  try {
    const { telephone } = req.body;

    // 1. نثبتو اللي رقم التليفون تبعث أصلاً
    if (!telephone) {
      return res
        .status(400)
        .json({ success: false, message: "الرجاء إدخال رقم الهاتف" });
    }

    // 2. نلوجو في الـ Base de données كان فما شكون شارك بنفس الرقم
    const existingParticipant = await Participant.findOne({
      telephone: telephone,
    });

    // 3. كان لقيناه، نرجعو إيرور ونقصّو العملية غادي (ما نتعداوش للـ handleSpin)
    if (existingParticipant) {
      return res.status(403).json({
        success: false,
        message: "شاركت معانا قبل، خلي فرصة لغيرك! 😉",
      });
    }

    // 4. كان الرقم جديد، نتعداو للـ étape اللي بعدها (spinController.handleSpin)
    next();
  } catch (error) {
    console.error("Erreur Anti-Fraude:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur lors de la vérification du numéro",
      });
  }
};

module.exports = antiFraude;
