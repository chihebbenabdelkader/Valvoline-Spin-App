const Participant = require("../models/Participant");

const User = require("../models/User");
const Prize = require("../models/Prize");

exports.signup = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const newUser = await User.create({ nom, prenom, email, password });
    res
      .status(201)
      .json({ success: true, message: "Admin créé", data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // 1. استقبلنا الـ username (اللي هو الـ email) والـ password
    const { username, password } = req.body;

    // 2. نلوجو في الداتابيز على الـ User اللي عندو هكا الـ Email
    // استعملنا email: username خاطر في الفورم متاعك الـ Input اسمو username
    const user = await User.findOne({ email: username });

    // 3. نثبتو هل الـ User موجود وهل الباسورد صحيح
    if (user && user.password === password) {
      // نبعثو نجاح العملية مع بيانات الـ User
      res.json({
        success: true,
        token: "valvoline-admin-token-2026",
        user: {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
        },
      });
    } else {
      // كان مالقاشو ولا الباسورد غلط
      res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect!",
      });
    }
  } catch (error) {
    console.error("Erreur Login:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. الإحصائيات الفوقانية (Stats)
    const totalParticipants = await Participant.countDocuments();

    // الهدايا الموزعة (اللي الكادو متاعهم موش En attente)
    const cadeauxDistribues = await Participant.countDocuments({
      cadeau: { $nin: ["En attente", null, ""] },
    });

    // الهدايا المتبقية (نجمعو الستوك اللي مازال في الـ Prizes الكل)
    const prizes = await Prize.find();
    const cadeauxRestants = prizes.reduce(
      (acc, curr) => acc + curr.stockRestant,
      0,
    );

    // المغازات النشطة (قداش من مغازة مختلفة شاركت)
    const magasinsActifsList = await Participant.distinct("magasin");
    const magasinsActifs = magasinsActifsList.length;

    // 2. آخر الرابحين (نجيبو آخر 5 رابحين)
    const recentWinnersData = await Participant.find({
      cadeau: { $nin: ["En attente", null, ""] },
    })
      .sort({ createdAt: -1 }) // من الأجدد للأقدم
      .limit(5);

    const recentWinners = recentWinnersData.map((p) => ({
      name: p.nom,
      phone: p.telephone,
      prize: p.cadeau,
      date: p.createdAt ? new Date(p.createdAt).toLocaleString("fr-FR") : "N/A",
    }));

    // 3. داتا الدائرة (Pie Chart - Répartition des cadeaux)
    const pieAggregation = await Participant.aggregate([
      { $match: { cadeau: { $nin: ["En attente", null, ""] } } },
      { $group: { _id: "$cadeau", count: { $sum: 1 } } },
    ]);

    const pieChart = {
      labels: pieAggregation.map((item) => item._id),
      values: pieAggregation.map((item) => item.count),
    };

    // 4. داتا الخط (Line Chart - Évolution par jour)
    const lineAggregation = await Participant.aggregate([
      {
        $group: {
          // نخرجو التاريخ format YYYY-MM-DD
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // نرتبوهم بالوقت
      { $limit: 7 }, // نجيبو آخر 7 أيام
    ]);

    const lineChart = {
      labels: lineAggregation.map((item) => item._id),
      values: lineAggregation.map((item) => item.count),
    };
    const magasinsAggregation = await Participant.aggregate([
      {
        $group: {
          _id: "$magasin",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } }, // نرتبوهم من الأكثر للأقل مشاركة
    ]);

    const magasinsList = magasinsAggregation.map((item) => ({
      magasin: item._id || "Non spécifié",
      count: item.count,
    }));

    // نبعثو الداتا مريڨلة للفرونت (Frontend)
    res.json({
      totalParticipants,
      cadeauxDistribues,
      cadeauxRestants,
      magasinsActifs,
      recentWinners,
      pieChart,
      lineChart,
      magasinsList,
    });
  } catch (error) {
    console.error("Erreur Dashboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
