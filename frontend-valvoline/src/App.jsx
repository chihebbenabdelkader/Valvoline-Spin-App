import React, { useState, useEffect } from "react";
import "./App.css";
import { spinService } from "./services/api";
import LuckyWheel from "./components/LuckyWheel";
import RegistrationForm from "./components/RegistrationForm";
import backgroundImage from "./assets/background.png";
import wheelImage from "./assets/Asset 5223.png";
import valvoLogo from "./assets/ValvoLogo.png";
import afrilubLogo from "./assets/afrilubLogo.png";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState(null);

  // ✅ Fix: --vh dynamic للموبايل
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  const handleFinalRegister = async (dataFromForm) => {
    const response = await spinService.handleSpin(dataFromForm);
    if (response.success) {
      setUserData({
        ...dataFromForm,
        participantId: response.participantId,
      });
      setShowForm(false);
      setCurrentPage("wheel");
    } else {
      throw new Error("مشكلة في تسجيل البيانات");
    }
  };

  const handleReset = () => {
    setCurrentPage("landing");
    setUserData(null);
    setShowForm(false);
  };

  if (currentPage === "landing") {
    return (
      // ✅ min-h بـ --vh بدل 100vh
      <div
        className="relative flex flex-col items-center overflow-hidden"
        style={{
          minHeight: "calc(var(--vh, 1vh) * 100)",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* ✅ Header */}
        <div className="mt-18 md:mt-16 text-center z-10 px-4">
          {/* 👇 بدّل الـ className باش تجرب كل واحد */}

          {/* 1️⃣ Fade in من الأعلى */}
          <h1 className="animate-glow text-white text-5xl sm:text-5xl md:text-6xl font-bold mb-2 tracking-tighter drop-shadow-lg">
            الربح على عجلة
          </h1>
          <p className="animate-glow text-white text-2xl sm:text-xl md:text-2xl font-bold drop-shadow">
            ! برشا كادوات يستناو فيك
          </p>

          {/* 2️⃣ Typewriter — بدّل فوق بهذا */}
          {/* <h1 className="animate-typewriter text-white text-5xl ..."> */}
          {/* <p className="animate-typewriter text-white text-2xl ..."> */}

          {/* 3️⃣ Glow وميض */}
          {/* <h1 className="animate-glow text-white text-5xl ..."> */}
          {/* <p className="animate-glow text-white text-2xl ..."> */}

          {/* 4️⃣ Bounce نزول مع ارتداد */}
          {/* <h1 className="animate-bounce-in text-white text-5xl ..."> */}
          {/* <p className="animate-bounce-in-delay text-white text-2xl ..."> */}
        </div>

        {/* ✅ العجلة: تكبر وتصغر حسب الشاشة */}
        <div className="flex-grow flex items-center justify-center w-full px-6 z-10">
          <div className="animate-spin-slow w-[360px] sm:w-[300px] md:w-[380px] lg:w-[420px]">
            <img
              src={wheelImage}
              alt="Wheel"
              className="w-full h-auto drop-shadow-2xl"
            />
          </div>
        </div>

        {/* ✅ الشعارات */}
        <div className="flex items-center justify-center gap-8 md:gap-12 mb-12 z-10 px-4">
          <div className="animate-valvoline">
            <img
              src={valvoLogo}
              alt="Valvoline Logo"
              className="h-24 sm:h-16 md:h-20 w-auto object-contain"
            />
          </div>
          <div className="h-10 w-[2px] bg-white/20 rounded-full hidden sm:block"></div>
          <div className="animate-afrilub">
            <img
              src={afrilubLogo}
              alt="Afrilub"
              className="h-24 sm:h-16 md:h-20 w-auto object-contain"
            />
          </div>
        </div>

        {/* ✅ الزر */}
        <div className="w-full max-w-md px-6 mb-12 md:mb-12 z-10">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-white text-[#E11D48] text-xl sm:text-2xl font-black py-4 sm:py-5 rounded-full shadow-2xl active:scale-95 transition-all"
          >
            شارك معانا
          </button>
        </div>

        <RegistrationForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onRegisterSuccess={handleFinalRegister}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <LuckyWheel userData={userData} onFinished={handleReset} />
    </div>
  );
}

export default App;
