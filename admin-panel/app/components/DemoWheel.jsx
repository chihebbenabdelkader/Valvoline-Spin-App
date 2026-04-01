import React, { useState, useEffect } from 'react';
import { PrizeService } from '../service/PrizeService';

const DemoWheel = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [angle, setAngle] = useState(0);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrizes = async () => {
            try {
                const data = await PrizeService.getPrizes();

                if (data.success) {
                    const availablePrizes = data.data.filter((p) => p.stockRestant > 0);

                    let formattedPrizes = [];

                    // 👈 التغيير هنا: نزيدو الكادو بالاحمر، وراه ديركت "Tirage" بالازرق
                    availablePrizes.forEach((prize) => {
                        const prizeColor = prize.stockInitial === 1 ? '#cd9a46' : '#ee2a24';
                        // 1. الكادو الأصلي (أحمر)
                        formattedPrizes.push({
                            id: prize._id,
                            name: prize.name,
                            image: prize.image,
                            color: prizeColor // أحمر
                        });

                        // 2. خانة Tirage au sort (أزرق)
                        formattedPrizes.push({
                            id: `tirage-${prize._id}`, // ID وهمي
                            name: 'tirage au sort',
                            image: null, // من غير تصويرة
                            color: '#0092d0' // أزرق
                        });
                    });

                    // باش العجلة ديما تظهر معبية كان الكادوات شوية (أقل من 6 خانات)
                    while (formattedPrizes.length > 0 && formattedPrizes.length < 6) {
                        formattedPrizes = [...formattedPrizes, ...formattedPrizes];
                    }

                    setItems(formattedPrizes);
                }
            } catch (error) {
                console.error('Erreur de chargement des cadeaux:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrizes();
    }, []);

    const sliceAngle = items.length > 0 ? 360 / items.length : 0;

    const spin = () => {
        if (isSpinning || items.length === 0) return;
        const rand = Math.floor(Math.random() * 360);
        const totalRotation = angle + 360 * 8 + rand;

        setIsSpinning(true);
        setAngle(totalRotation);

        setTimeout(() => {
            setIsSpinning(false);
        }, 5000);
    };

    if (loading) {
        return <div className="p-5 text-center font-bold text-500">جاري تحميل الهدايا...</div>;
    }

    if (items.length === 0) {
        return <div className="p-5 text-center font-bold text-500">عذراً، لا يوجد هدايا مسجلة أو متوفرة في المخزون.</div>;
    }

    return (
        <div className="flex flex-column align-items-center justify-content-center w-full py-4">
            <div className="relative mb-5" style={{ width: '380px', height: '380px' }}>
                <div
                    style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 50,
                        width: 0,
                        height: 0,
                        borderLeft: '20px solid transparent',
                        borderRight: '20px solid transparent',
                        borderTop: '35px solid #D4AF37',
                        filter: 'drop-shadow(0px 4px 5px rgba(0,0,0,0.4))'
                    }}
                ></div>

                <svg
                    viewBox="0 0 400 400"
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '12px solid #D4AF37',
                        boxShadow: '0 0 25px rgba(0,0,0,0.3)',
                        transition: 'transform 5000ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                        transform: `rotate(${angle}deg)`
                    }}
                >
                    {items.length === 1 ? (
                        <g>
                            <circle cx="200" cy="200" r="200" fill={items[0].color} />
                            {items[0].image && <image href={`http://localhost:5000/${items[0].image}`} x="150" y="40" width="100" height="100" preserveAspectRatio="xMidYMid meet" />}
                            <text x="200" y="180" fill="white" fontSize="24" fontWeight="bold" textAnchor="middle">
                                {items[0].name}
                            </text>
                        </g>
                    ) : (
                        items.map((item, i) => {
                            const startAngle = i * sliceAngle;
                            const endAngle = (i + 1) * sliceAngle;
                            const x1 = 200 + 200 * Math.cos(((startAngle - 90) * Math.PI) / 180);
                            const y1 = 200 + 200 * Math.sin(((startAngle - 90) * Math.PI) / 180);
                            const x2 = 200 + 200 * Math.cos(((endAngle - 90) * Math.PI) / 180);
                            const y2 = 200 + 200 * Math.sin(((endAngle - 90) * Math.PI) / 180);
                            const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                            const midAngle = (startAngle + endAngle) / 2 - 90;
                            let normalizedAngle = midAngle % 360;
                            if (normalizedAngle < 0) normalizedAngle += 360;
                            const isLeft = normalizedAngle > 90 && normalizedAngle < 270;

                            const words = item.name.split(' ');
                            let formattedLines = [item.name];

                            // 👈 استثناء: كان الكلمة هي "tirage au sort"، نخليوها ديما في سطر واحد
                            if (item.name.toLowerCase() !== 'tirage au sort' && item.name.length > 14 && words.length > 1) {
                                if (words.length === 3) {
                                    formattedLines = [`${words[0]} ${words[1]}`, words[2]];
                                } else {
                                    const mid = Math.ceil(words.length / 2);
                                    formattedLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
                                }
                            }

                            const textDist = item.image ? 300 : 290;
                            const imageDist = 370;

                            return (
                                <g key={i}>
                                    <path d={`M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2} Z`} fill={item.color} stroke="#D4AF37" strokeWidth="3" />

                                    <g transform={`rotate(${midAngle}, 200, 200)`}>
                                        {item.image && (
                                            <image href={`http://localhost:5000/${item.image}`} x={imageDist - 25} y={200 - 25} width="50" height="50" preserveAspectRatio="xMidYMid meet" transform={isLeft ? `rotate(180, ${imageDist}, 200)` : ''} />
                                        )}

                                        <text
                                            x={textDist}
                                            y="200"
                                            fill="white"
                                            fontSize={items.length > 8 ? '13' : '16'}
                                            fontWeight="900"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            transform={isLeft ? `rotate(180, ${textDist}, 200)` : ''}
                                            style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.7)' }}
                                        >
                                            {formattedLines.map((line, wIdx) => (
                                                <tspan x={textDist} dy={wIdx === 0 ? (formattedLines.length === 1 ? '0' : '-0.6em') : '1.2em'} key={wIdx}>
                                                    {line}
                                                </tspan>
                                            ))}
                                        </text>
                                    </g>
                                </g>
                            );
                        })
                    )}
                    <circle cx="200" cy="200" r="10" fill="url(#goldGradient)" stroke="white" strokeWidth="2" />

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
                style={{
                    backgroundColor: '#E11D48',
                    color: 'white',
                    fontWeight: '900',
                    padding: '1rem 3.5rem',
                    borderRadius: '50px',
                    fontSize: '1.4rem',
                    border: '4px solid white',
                    boxShadow: '0 10px 25px rgba(225,29,72,0.4)',
                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    marginTop: '1.5rem'
                }}
            >
                {isSpinning ? 'قاعدين ندوروا...' : 'إضغط للربح!'}
            </button>

            <p className="mt-4 text-500 font-bold tracking-widest text-sm uppercase">VALVOLINE X AFRILUB</p>
        </div>
    );
};

export default DemoWheel;
