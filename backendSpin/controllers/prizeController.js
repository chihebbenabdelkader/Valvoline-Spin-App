const Prize = require("../models/Prize");
const Participant = require("../models/Participant");

// 1. نجيبو الكادوات (باللوجيك الذكي متع الستوك)
// 1. نجيبو الكادوات (باللوجيك الذكي متع الستوك)
exports.getAllPrizes = async (req, res) => {
  try {
    const prizes = await Prize.find();

    // نحددو بداية ونهاية اليوم (باش نحسبو الرابحين متع اليوم برك)
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    // نخرجو الوقت الحالي بصيغة "HH:MM" (مثال "14:30")
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTimeString = `${currentHour}:${currentMinute}`;

    // نخرجو التاريخ الحالي بصيغة "YYYY-MM-DD"
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
    const currentDay = now.getDate().toString().padStart(2, "0");
    const currentDateString = `${now.getFullYear()}-${currentMonth}-${currentDay}`;

    // 🚨 اللوجيك الذكي: ندورو على الكادوات ونبدلو الستوك حسب الشروط
    const smartPrizes = await Promise.all(
      prizes.map(async (prize) => {
        let effectiveStock = prize.stockRestant;

        // كان مازال فيه ستوك أصلاً، نزيدو نثبتو في الشروط
        if (effectiveStock > 0) {
          
          // 1️⃣ شرط التاريخ: كان مبرمج لتواريخ معينة، واليوم موش واحد منهم -> ستوك 0
          if (
            prize.dateSpecifique &&
            !prize.dateSpecifique.includes(currentDateString) // 👈 التغيير الوحيد هوني!
          ) {
            effectiveStock = 0;
          }

          // 2️⃣ شرط الوقت: كان مبرمج لوقت معين، وتوا موش وقتو -> ستوك 0
          if (prize.heureDebut && currentTimeString < prize.heureDebut) {
            effectiveStock = 0;
          }
          if (prize.heureFin && currentTimeString > prize.heureFin) {
            effectiveStock = 0;
          }

          // 3️⃣ شرط الماكس في النهار: نحسبو قداش خرج منو اليوم
          if (prize.maxParJour > 0 && effectiveStock > 0) {
            const dailyWinsCount = await Participant.countDocuments({
              cadeau: prize.name,
              updatedAt: { $gte: startOfDay, $lt: endOfDay },
            });

            // كان عدد الرابحين اليوم فات أو ساوى الماكس -> ستوك 0
            if (dailyWinsCount >= prize.maxParJour) {
              effectiveStock = 0;
            }
          }
        }

        // نرجعو الكادو، أما نعطيوه الستوك الوهمي (الذكي) اللي حسبناه
        const prizeObj = prize.toObject();
        return {
          ...prizeObj,
          stockRestant: effectiveStock,
        };
      }),
    );

    res.json({ success: true, data: smartPrizes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Nzidou cadeau jdid (M3a Taswira + Conditions)
exports.createPrize = async (req, res) => {
  try {
    const {
      name,
      stockInitial,
      maxParJour,
      heureDebut,
      heureFin,
      dateSpecifique,
    } = req.body;
    let imagePath = "";
    if (req.file) imagePath = req.file.path.replace(/\\/g, "/");

    const initialNum = Number(stockInitial) || 0;

    const newPrize = await Prize.create({
      name,
      stockInitial: initialNum,
      stockRestant: initialNum,
      image: imagePath,
      maxParJour: maxParJour ? Number(maxParJour) : null,
      heureDebut: heureDebut || null,
      heureFin: heureFin || null,
      dateSpecifique: dateSpecifique || null,
    });

    res.json({
      success: true,
      data: newPrize,
      message: "Cadeau ajouté avec conditions",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Update cadeau
exports.updatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      stockInitial,
      stockRestant,
      maxParJour,
      heureDebut,
      heureFin,
      dateSpecifique,
    } = req.body;

    let updateData = {
      name,
      stockInitial: Number(stockInitial),
      stockRestant:
        stockRestant !== undefined
          ? Number(stockRestant)
          : Number(stockInitial),
      maxParJour: maxParJour ? Number(maxParJour) : null,
      heureDebut: heureDebut || null,
      heureFin: heureFin || null,
      dateSpecifique: dateSpecifique || null,
    };

    if (req.file) updateData.image = req.file.path.replace(/\\/g, "/");

    const updatedPrize = await Prize.findByIdAndUpdate(id, updateData, {
      returnDocument: "after", // 👈 هذي تصلح التنبيه متاع Mongoose
    });

    res.json({
      success: true,
      data: updatedPrize,
      message: "Cadeau mis à jour",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. N-fasskhou cadeau
exports.deletePrize = async (req, res) => {
  try {
    const { id } = req.params;
    await Prize.findByIdAndDelete(id);
    res.json({ success: true, message: "Cadeau supprimé" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
