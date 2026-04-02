const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); // تأكد إنو المسار صحيح (index.js أو server.js)
const Prize = require("../models/Prize");
const Participant = require("../models/Participant");

describe("Prize Logic Unit Tests - Full Coverage", () => {
  // قبل كل تيست، نظفوا الداتابيز باش النتائج ما تتداخلش
  beforeEach(async () => {
    await Prize.deleteMany({});
    await Participant.deleteMany({});
  });

  // بعد ما يوفاو التيستات الكل، نسكروا الـ Connection
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1️⃣ اختبار الستوك الحقيقي (Physical Stock)
  it("يجب أن يرجع isAvailable: false إذا كان المخزن الحقيقي 0", async () => {
    await Prize.create({
      name: "Kado Fari8",
      stockInitial: 10,
      stockRestant: 0, // وفى من المخزن
      maxParJour: 5,
      dateSpecifique: [],
    });

    const res = await request(app).get("/api/prizes");
    const target = res.body.data.find((p) => p.name === "Kado Fari8");

    expect(target.isAvailable).toBe(false);
  });
it("يجب أن يرجع isAvailable: false إذا تجاوزنا الحد اليومي (maxParJour)", async () => {
  const prize = await Prize.create({
    name: "TV 4K",
    stockInitial: 5,
    stockRestant: 5,
    maxParJour: 1,
    dateSpecifique: [],
  });

  // 💡 الفازة هنا: نصنعو تاريخ "توّة" بالظبط من غير UTC offsets
  const now = new Date();

  await Participant.create({
    nom: "Test User",
    email: "test@test.com",
    telephone: "22333444",
    ville: "Tunis",
    magasin: "Magasin X",
    cadeau: "TV 4K",
    giftId: prize._id,
    // 🚨 نضمنوا إنو الـ createdAt يكون في وسط الـ Range متاع اليوم
    createdAt: now,
  });

  // نبعثو الـ Request
  const res = await request(app).get("/api/prizes");

  const targetPrize = res.body.data.find((p) => p.name === "TV 4K");

  // توّة المفروض يلقى countToday = 1 ، دونك يرجع false
  expect(targetPrize.isAvailable).toBe(false);
});
  // 3️⃣ اختبار التاريخ (Specific Dates)
  it("يجب أن يرجع isAvailable: false إذا كان تاريخ اليوم غير موجود في القائمة", async () => {
    await Prize.create({
      name: "Kado l'3am l'jay",
      stockInitial: 10,
      stockRestant: 10,
      dateSpecifique: ["2099-01-01"], // تاريخ بعيد
    });

    const res = await request(app).get("/api/prizes");
    const target = res.body.data.find((p) => p.name === "Kado l'3am l'jay");

    expect(target.isAvailable).toBe(false);
  });

  // 4️⃣ اختبار الوقت (Time Range - Early)
  it("يجب أن يرجع isAvailable: false إذا كان الوقت الحالي قبل وقت البداية", async () => {
    await Prize.create({
      name: "Kado mta3 l'fajr",
      stockInitial: 10,
      stockRestant: 10,
      heureDebut: "04:00",
      heureFin: "05:00", // الوقت توة غالباً موش الفجر
    });

    const res = await request(app).get("/api/prizes");
    const target = res.body.data.find((p) => p.name === "Kado mta3 l'fajr");

    expect(target.isAvailable).toBe(false);
  });

  // 5️⃣ اختبار الحالة الناجحة (All Conditions Met)
  it("يجب أن يرجع isAvailable: true إذا كانت كل الشروط محققة", async () => {
    const today = new Date().toISOString().split("T")[0]; // تاريخ اليوم بالظبط

    await Prize.create({
      name: "Kado Disponible",
      stockInitial: 10,
      stockRestant: 10,
      maxParJour: 100,
      dateSpecifique: [today], // اليوم متاح
      heureDebut: "00:00",
      heureFin: "23:59", // الوقت متاح كامل اليوم
    });

    const res = await request(app).get("/api/prizes");
    const target = res.body.data.find((p) => p.name === "Kado Disponible");

    expect(target.isAvailable).toBe(true); // ✅ هوني لازم يظهر أخضر
  });
});
