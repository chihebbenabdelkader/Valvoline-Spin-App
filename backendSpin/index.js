require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const spinRoutes = require("./routes/spinRoutes");
const adminRoutes = require("./routes/adminRoutes");
const prizeRoutes = require("./routes/prizeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;


// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB:", err));

// Middleware
app.use(
  cors({
    origin: "*", // يسمح لكل الأجهزة (بما فيها تليفونك) بالاتصال
  }),
);app.use(express.json()); // Bech yakra el data mta el formulaire (JSON)

// Routes
app.use("/api/prizes", prizeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", spinRoutes);


// Health Check
app.get("/", (req, res) => {
  res.send("Server MUVEIT for Afrolub is Running... 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
