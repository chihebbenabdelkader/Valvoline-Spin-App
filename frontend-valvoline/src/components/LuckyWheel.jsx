import Swal from "sweetalert2";
import { spinService } from "../services/api"; // تأكد من المسار
import backgroundImage from "../assets/background.png"; // تأكد من المسار
import { useState, useEffect } from "react";

const LuckyWheel = ({ userData, onFinished }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب الهدايا من الباكاند
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/prizes");
        const data = await response.json();

        if (data.success) {
const allPrizes = data.data;
          let formattedPrizes = [];

         allPrizes.forEach((prize) => {
           const prizeColor = prize.stockInitial === 1 ? "#cd9a46" : "#ee2a24";
           // 1. الكادو الأصلي (أحمر)
           formattedPrizes.push({
             id: prize._id,
             name: prize.name,
             image: prize.image,
             color: prizeColor, // أحمر
             stockRestant: prize.stockRestant, // 👈 سجلنا الستوك باش نستحقوه في الدوران
           });

           // خانة Tirage au sort (أزرق)
           formattedPrizes.push({
             id: `tirage-${prize._id}`,
             name: "tirage au sort",
             image: null,
             color: "#0092d0",
             stockRestant: 99999, // 👈 التیراج ديما فيه ستوك لا نهائي باش ديما تنجم تطيح فيه
           });
         });

       

          setItems(formattedPrizes);
        }
      } catch (error) {
        console.error("Erreur de chargement des cadeaux:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  const sliceAngle = items.length > 0 ? 360 / items.length : 0;

  // 2. منطق دوران العجلة والربح
  const spin = () => {
    if (isSpinning || items.length === 0) return;
    const rand = Math.floor(Math.random() * 360);
    const totalRotation = angle + 360 * 8 + rand;

    setIsSpinning(true);
    setAngle(totalRotation);

    const actualAngle = (360 - (totalRotation % 360)) % 360;
    const winnerIdx = Math.floor(actualAngle / sliceAngle);
    const winner = items[winnerIdx];

    setTimeout(async () => {
      setIsSpinning(false);
      try {
        // 👈 التغيير هنا: زدنا giftId: winner.id 
        await spinService.submitSpin({ 
            ...userData, 
            giftName: winner.name, 
            giftId: winner.id 
        });
      } catch (e) {
        console.error(e);
      }

      Swal.fire({
        title: "🎉 مبروك ربحت!",
        html: `<b style="font-size: 24px; color: ${winner.color};">${winner.name}</b>`,
        icon: "success",
        confirmButtonColor: "#E11D48",
      }).then(onFinished);
    }, 5000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black/80 text-white font-bold text-2xl">
        <i className="pi pi-spin pi-spinner text-5xl mb-4 text-[#E11D48]"></i>
        جاري تحميل الهدايا...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black/80 text-white font-bold text-3xl">
        عذراً، انتهت الهدايا حالياً! 😔
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
        <div className="relative mb-8 mt-4">
          {/* السهم الذهبي (مستعملين Tailwind) */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 w-0 h-0 
                       border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent 
                       border-t-[40px] border-t-[#D4AF37] drop-shadow-xl"
          ></div>

          <svg
            viewBox="0 0 400 400"
            className="w-[320px] h-[320px] md:w-[450px] md:h-[450px] rounded-full border-[12px] border-[#D4AF37] 
                       shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-transform duration-[5000ms] ease-out"
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

              // تقسيم الكتيبة
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

              const textDist = item.image ? 300 : 290;
              const imageDist = 370;

              return (
                <g key={i}>
                  <path
                    d={`M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    stroke="#D4AF37"
                    strokeWidth="3"
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
                     transition-all border-4 border-white uppercase italic mt-6"
        >
          {isSpinning ? "قاعدين ندوروا..." : "إضغط للربح!"}
        </button>

        <p className="mt-6 md:mt-8 text-white/80 font-bold tracking-widest text-sm uppercase drop-shadow-md">
          VALVOLINE X AFRILUB
        </p>
      </div>
    </div>
  );
};

export default LuckyWheel;
