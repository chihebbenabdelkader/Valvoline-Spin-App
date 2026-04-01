import React, { useState } from "react";
import "./App.css";
import { spinService } from "./services/api";
import LuckyWheel from "./components/LuckyWheel";
import RegistrationForm from "./components/RegistrationForm";
import backgroundImage from "./assets/background.png";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState(null);

  // 👈 كود أنظف من غير try/catch زايد
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
      <div
        className="main-bg-layout flex flex-col items-center min-h-screen"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
        }}
      >
        <div className="mt-16 text-center z-10">
          <h1 className="text-white text-5xl md:text-6xl font-bold mb-2 tracking-tighter shadow-black">
            الربح على عجلة
          </h1>
          <p className="text-white text-xl md:text-2xl font-bold">
            ! برشا كادوات يستناو فيك
          </p>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin-slow w-[350px]">
            <img
              src="src/assets/Asset 5223.png"
              alt="Wheel"
              className="w-full h-auto drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-12 mt-8 mb-6 z-10 px-4">
          <div className="animate-valvoline">
            <img
              src="src/assets/ValvoLogo.png"
              alt="Valvoline Logo"
              className="h-16 md:h-24 w-auto object-contain"
            />
          </div>
          <div className="h-12 w-[2px] bg-white/20 rounded-full hidden md:block"></div>
          <div className="animate-afrilub">
            <img
              src="src/assets/afrilubLogo.png"
              alt="Afrilub"
              className="h-16"
            />
          </div>
        </div>

        <div className="w-full max-w-md px-6 mb-12 z-10">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-white text-[#E11D48] text-2xl font-black py-5 rounded-full shadow-2xl"
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
