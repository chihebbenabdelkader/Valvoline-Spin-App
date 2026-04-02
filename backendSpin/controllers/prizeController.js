const Prize = require("../models/Prize");
const Participant = require("../models/Participant");

// 1. نجيبو الكادوات (اللوجيك الذكي)
exports.getAllPrizes = async (req, res) => {
  try {
    const prizes = await Prize.find();
    const serverTime = new Date(); // استعملنا serverTime باش ما نغلطوش

    const currentHourStr =
      serverTime.getHours().toString().padStart(2, "0") +
      ":" +
      serverTime.getMinutes().toString().padStart(2, "0");

    const currentDateStr = serverTime.toISOString().split("T")[0];

    const startOfDay = new Date(serverTime);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(serverTime);
    endOfDay.setHours(23, 59, 59, 999);

    const smartPrizes = await Promise.all(
      prizes.map(async (p) => {
        // استعملت 'p' عوض 'prize' للتفادي
        let isAvailable = true;
        if (p.stockRestant <= 0) isAvailable = false;

        if (isAvailable && p.dateSpecifique && p.dateSpecifique.length > 0) {
          if (!p.dateSpecifique.includes(currentDateStr)) isAvailable = false;
        }

        if (isAvailable) {
          if (p.heureDebut && currentHourStr < p.heureDebut)
            isAvailable = false;
          if (p.heureFin && currentHourStr > p.heureFin) isAvailable = false;
        }

        if (isAvailable && p.maxParJour > 0) {
          const countToday = await Participant.countDocuments({
            giftId: p._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          });
          if (countToday >= p.maxParJour) isAvailable = false;
        }
        return { ...p.toObject(), isAvailable };
      }),
    );

    res.json({ success: true, data: smartPrizes }); // تأكد إن السطر هذا موجود
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. صنع كادو جديد
exports.createPrize = async (req, res) => {
    try {
        const { name, stockInitial, maxParJour, heureDebut, heureFin, dateSpecifique } = req.body;
        
        let imagePath = "";
        if (req.file) imagePath = req.file.path.replace(/\\/g, "/");

        // تحويل الـ dateSpecifique لـ Array لو كانت مبعوثة كـ String مفرق بفاصلة
        let datesArray = [];
        if (dateSpecifique) {
            datesArray = typeof dateSpecifique === 'string' ? dateSpecifique.split(',') : dateSpecifique;
        }

        const initialNum = Number(stockInitial) || 0;

        const newPrize = await Prize.create({
            name,
            stockInitial: initialNum,
            stockRestant: initialNum,
            image: imagePath,
            maxParJour: maxParJour ? Number(maxParJour) : null,
            heureDebut: heureDebut || null,
            heureFin: heureFin || null,
            dateSpecifique: datesArray, // 👈 ديما Array
        });

        res.json({ success: true, data: newPrize });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. تحديث كادو
exports.updatePrize = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stockInitial, stockRestant, maxParJour, heureDebut, heureFin, dateSpecifique } = req.body;

        let datesArray = [];
        if (dateSpecifique) {
            datesArray = typeof dateSpecifique === 'string' ? dateSpecifique.split(',') : dateSpecifique;
        }

        let updateData = {
            name,
            stockInitial: Number(stockInitial),
            stockRestant: Number(stockRestant),
            maxParJour: maxParJour ? Number(maxParJour) : null,
            heureDebut: heureDebut || null,
            heureFin: heureFin || null,
            dateSpecifique: datesArray,
        };

        if (req.file) updateData.image = req.file.path.replace(/\\/g, "/");

        const updatedPrize = await Prize.findByIdAndUpdate(id, updateData, { new: true });

        res.json({ success: true, data: updatedPrize });
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
