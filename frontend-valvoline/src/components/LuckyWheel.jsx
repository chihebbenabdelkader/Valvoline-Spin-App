import Swal from "sweetalert2";
import { spinService } from "../services/api"; // تأكد من المسار
import backgroundImage from "../assets/background.png"; // تأكد من المسار
import { useState, useEffect, useRef } from "react";
import wheelFrame from "../assets/wheel-frame.png"; // 👈 استورد تصويرة الإطار هنا

const LuckyWheel = ({ userData, onFinished }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const spinAudio = useRef(null);
  const winAudio = useRef(null);

  useEffect(() => {
    spinAudio.current = new Audio("/sounds/spinning.mp3");
    winAudio.current = new Audio("/sounds/win.mp3");
    if (spinAudio.current) spinAudio.current.volume = 0.6;
    if (winAudio.current) winAudio.current.volume = 0.8;

    const fetchPrizes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/prizes");
        const data = await response.json();
      if (data.success) {
        const allPrizes = data.data;
        let formattedPrizes = [];

        allPrizes.forEach((prize) => {
          const prizeColor = prize.stockInitial === 1 ? "#cd9a46" : "#ee2a24";

          // نزيدو الكادو ديما (حتى لو prize.stockRestant === 0)
          formattedPrizes.push({
            id: prize._id,
            name: prize.name,
            image: prize.image,
            color: prizeColor,
            stockRestant: prize.stockRestant, // الـ stockRestant الذكي من الباكاند
            isAvailable: prize.isAvailable, // 👈 زيد هذي ضروري جداً
          });

          // نزيدو الـ Tirage ديما
          formattedPrizes.push({
            id: `tirage-${prize._id}`,
            name: "tirage au sort",
            image: null,
            color: "#0092d0",
            stockRestant: 99999,
          });
        });
        setItems(formattedPrizes);
      }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrizes();
  }, []);

  const sliceAngle = items.length > 0 ? 360 / items.length : 0;

const spin = () => {
  // 1. الحماية المعتادة
  if (isSpinning || items.length === 0) return;

  // 🔊 تشغيل صوت الدوران
  if (spinAudio.current) {
    spinAudio.current.currentTime = 0;
    spinAudio.current.loop = true;
    spinAudio.current.play().catch((e) => console.log("Audio play blocked", e));
  }

  // 2. نختاروا زاوية عشوائية مبدئية (هذي اللي كانت باش تاقف فيها العجلة)
  let rand = Math.floor(Math.random() * 360);

  // 3. نحسبوا شكون "الرابح المبدئي" حسب الزاوية rand
  const actualAngle = (360 - (rand % 360)) % 360;
  const winnerIdx = Math.floor(actualAngle / sliceAngle);
  const initialWinner = items[winnerIdx];

  let finalStopAngle = rand;

  // 🚨 4. اللوجيك الذكي (التحويل للـ Tirage)
  if (initialWinner.isAvailable === false) {
    console.log(
      "🚫 الكادو موجود أما 'ممنوع' يخرج توّة (وقت/تاريخ/ماكس). تحويل للـ Tirage...",
    );

    // الخانة اللي بعدها ديما هي الـ Tirage au sort (حسب الـ formattedPrizes متاعنا)
    const nextIdx = (winnerIdx + 1) % items.length;

    // نحسبوا السنتر متاع خانة الـ Tirage au sort بالظبط
    const targetMidAngle = nextIdx * sliceAngle + sliceAngle / 2;

    // نصلحو الـ finalStopAngle باش السهم يجي في الـ Tirage
    finalStopAngle = (360 - targetMidAngle) % 360;
  }

  // 5. الحسبة النهائية للدوران (8 دورات كاملة + الزاوية المصلحة)
  const totalRotation =
    angle + 360 * 8 + ((finalStopAngle - (angle % 360) + 360) % 360);

  setIsSpinning(true);
  setAngle(totalRotation);

  // 6. تحديد الرابح النهائي (اللي باش نبعثوه للباكاند)
  const finalActualAngle = (360 - (totalRotation % 360)) % 360;
  const finalWinnerIdx = Math.floor(finalActualAngle / sliceAngle);
  const winner = items[finalWinnerIdx];

  // 7. الـ Timer متاع الـ 5 ثواني (وقت الـ Animation)
  setTimeout(async () => {
    setIsSpinning(false);

    if (spinAudio.current) {
      spinAudio.current.pause();
      spinAudio.current.currentTime = 0;
    }

    if (winAudio.current) {
      winAudio.current.currentTime = 0;
      winAudio.current.load(); // 👈 نضمنوا إنو الـ Buffer تعبّى
      winAudio.current.play().catch((e) => console.log("Win audio error", e));
    }

    try {
      await spinService.submitSpin({
        ...userData,
        giftName: winner.name,
        giftId: winner.id,
      });
    } catch (err) {
      console.error("Error submitting spin:", err);
    }

    // 🎯 تحضير الميساج حسب النتيجة (Tirage أو كادو)
    const isTirage = winner.name.toLowerCase() === "tirage au sort";

    // نجبدو اسم المشارك (ثبّت كان عندك firstName و lastName في الـ userData)
    const participantName =
      `${userData.nom || ""} `.trim();

    Swal.fire({
      title: "",
      html: `
        <div style="direction: rtl; font-family: 'Cairo', sans-serif; padding: 10px;">
          
          <h2 style="color: #E11D48; font-size: 32px; font-weight: 900; margin-bottom: 5px;">
            🎉 مبروك ${participantName} !
          </h2>

          <p style="font-size: 18px; color: #444; font-weight: 600; margin-bottom: 20px;">
            ${isTirage ? "دخلت معانا في القرعة الكبيرة" : "ربحت معانا هدية مميزة"}
          </p>

          <div style="
            background: linear-gradient(145deg, #ffffff, #f0f0f0);
            padding: 20px;
            border-radius: 20px;
            border: 3px solid ${winner.color};
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            display: inline-block;
            min-width: 80%;
          ">
            <span style="
              font-size: 26px; 
              color: ${winner.color}; 
              font-weight: 900; 
              text-transform: uppercase;
              letter-spacing: 1px;
            ">
              ${winner.name}
            </span>
          </div>

        </div>
      `,
      icon: isTirage ? "info" : "success",
      confirmButtonText: "موافق",
      confirmButtonColor: "#29a849",
      background: "#fff",
      customClass: {
        popup: "rounded-3xl shadow-2xl",
      },
    }).then(onFinished);
  }, 5000);
};; 

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black/80 text-white font-bold text-2xl">
        <i className="pi pi-spin pi-spinner text-5xl mb-4 text-[#E11D48]"></i>
        جاري تحميل الهدايا...
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
        {/* Container الرئيسي للعجلة */}
        <div className="relative mb-8 mt-4">
          {/* 1. السهم الذهبي (ثابت فوق الكل) */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-[60] w-0 h-0 
                       border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent 
                       border-t-[40px] border-t-[#D4AF37] drop-shadow-xl"
          ></div>

          {/* 2. الإطار الذهبي (الـ Contour اللي زدتوه) - ثابت لا يدور */}
          <img
            src={wheelFrame}
            alt="Wheel Contour"
            className="absolute top-0 left-0 w-full h-full z-50 pointer-events-none scale-[1.03]"
            /* 💡 استعملنا scale[1.03] باش يجي مغطي حواف الـ SVG بالظبط */
          />

          {/* 3. العجلة (الـ SVG الأصلي متاعك) - هي اللي تدور */}
          <svg
            viewBox="0 0 400 400"
            className="w-[320px] h-[320px] md:w-[450px] md:h-[450px] rounded-full transition-transform duration-[5000ms] ease-out z-40"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {items.map((item, i) => {
              const startAngle = i * sliceAngle;
              const endAngle = (i + 1) * sliceAngle;
              const x1 =
                200 + 200 * Math.cos(((startAngle - 90) * Math.PI) / 180);
              const y1 =
                200 + 200 * Math.sin(((startAngle - 90) * Math.PI) / 180);
              const x2 =
                200 + 200 * Math.cos(((endAngle - 90) * Math.PI) / 180);
              const y2 =
                200 + 200 * Math.sin(((endAngle - 90) * Math.PI) / 180);
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const midAngle = (startAngle + endAngle) / 2 - 90;
              let normalizedAngle = midAngle % 360;
              if (normalizedAngle < 0) normalizedAngle += 360;
              const isLeft = normalizedAngle > 90 && normalizedAngle < 270;

              const words = item.name.split(" ");
              let formattedLines = [item.name];
              if (
                item.name.toLowerCase() !== "tirage au sort" &&
                item.name.length > 14 &&
                words.length > 1
              ) {
                if (words.length === 3) {
                  formattedLines = [`${words[0]} ${words[1]}`, words[2]];
                } else {
                  const mid = Math.ceil(words.length / 2);
                  formattedLines = [
                    words.slice(0, mid).join(" "),
                    words.slice(mid).join(" "),
                  ];
                }
              }

              const textDist = item.image ? 292 : 290;
              const imageDist = 360;

              return (
                <g key={i}>
                  <path
                    d={`M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    stroke="rgba(255,255,255,0.1)" /* نقصنا في الـ stroke باش ما يفسدش الديزاين الجديد */
                    strokeWidth="1"
                  />
                  <g transform={`rotate(${midAngle}, 200, 200)`}>
                    {item.image && (
                      <image
                        href={`http://localhost:5000/${item.image}`}
                        x={imageDist - 25}
                        y={200 - 25}
                        width="50"
                        height="50"
                        preserveAspectRatio="xMidYMid meet"
                        transform={
                          isLeft ? `rotate(180, ${imageDist}, 200)` : ""
                        }
                      />
                    )}
                    <text
                      x={textDist}
                      y="200"
                      fill="white"
                      fontSize={items.length > 8 ? "13" : "16"}
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={isLeft ? `rotate(180, ${textDist}, 200)` : ""}
                      style={{ textShadow: "2px 2px 5px rgba(0,0,0,0.7)" }}
                    >
                      {formattedLines.map((line, wIdx) => (
                        <tspan
                          x={textDist}
                          dy={
                            wIdx === 0
                              ? formattedLines.length === 1
                                ? "0"
                                : "-0.6em"
                              : "1.2em"
                          }
                          key={wIdx}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                </g>
              );
            })}
            <circle
              cx="200"
              cy="200"
              r="10"
              fill="url(#goldGradient)"
              stroke="white"
              strokeWidth="3"
            />
            <defs>
              <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDE08B" />
                <stop offset="100%" stopColor="#D4AF37" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <button
          onClick={spin}
          disabled={isSpinning || items.length === 0}
          className="bg-[#E11D48] text-white font-black py-4 px-16 md:py-5 md:px-20 rounded-full text-2xl md:text-3xl 
                     shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 
                     transition-all border-4 border-white uppercase italic mt-6 z-20"
        >
          {isSpinning ? "قاعدين ندوروا..." : "إضغط للربح!"}
        </button>

        <p className="mt-6 md:mt-8 text-white/80 font-bold tracking-widest text-sm uppercase drop-shadow-md z-20">
          VALVOLINE X AFRILUB
        </p>
      </div>
    </div>
  );
};

export default LuckyWheel;