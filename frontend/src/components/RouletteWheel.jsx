import { useState, useEffect } from "react";
import { fetchRecipes } from "../api/recipesApi";
import { getFoodImage, getFallbackImage } from "../utils/foodImages";
import { trackQuestAction } from "./ChefQuest";

export default function RouletteWheel({ onSelectRecipe, onClose }) {
    const [recipes, setRecipes] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState(null);
    const [isRevealed, setIsRevealed] = useState(false);

    // Fetch a random batch of recipes for the wheel
    useEffect(() => {
        fetchRecipes(1, 12).then((res) => {
            setRecipes(res.data || []);
        });
    }, []);

    const spin = () => {
        if (spinning || recipes.length === 0) return;

        setSpinning(true);
        setWinner(null);
        setIsRevealed(false);

        // Random rotation between 5 and 10 full spins (1800-3600 deg) + random offset
        const spins = 5 + Math.random() * 5;
        const offset = Math.random() * 360;
        const totalRotation = rotation + spins * 360 + offset;

        setRotation(totalRotation);

        // Calculate winner
        setTimeout(() => {
            const normalizedRotation = totalRotation % 360;
            const sliceAngle = 360 / recipes.length;

            // The pointer is at the TOP (270 degrees in SVG coords, or -90)
            // But we rotate the entire wheel. 
            // If rotation is 0, the slice at 0deg is at 3 o'clock.
            // To be at 12 o'clock, it must rotate -90deg.
            // So effective angle matches pointer when: (startAngle + rotation) % 360 = 270

            // Let's reverse calculation:
            // The slice under the pointer (at 270deg) is:
            // (270 - rotation) % 360

            let angleAtPointer = (270 - normalizedRotation) % 360;
            if (angleAtPointer < 0) angleAtPointer += 360;

            const winningIndex = Math.floor(angleAtPointer / sliceAngle);

            const winningRecipe = recipes[winningIndex];
            setWinner(winningRecipe);
            setSpinning(false);

            trackQuestAction("SPIN_WHEEL");
        }, 4000);
    };

    if (recipes.length === 0) return null;


    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>

                <h2 style={styles.title}>Recipe Roulette</h2>
                <p style={styles.subtitle}>Spin for your next meal!</p>

                <div style={styles.wheelWrapper}>
                    {/* SVG Wheel */}
                    <svg viewBox="-1.1 -1.1 2.2 2.2" style={{
                        width: "100%", height: "100%",
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning ? "transform 4s cubic-bezier(0.15, 0.2, 0.1, 1.05)" : "none",
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))"
                    }}>
                        {/* Outer Rim */}
                        <circle cx="0" cy="0" r="1.02" fill="#334155" stroke="#f1f5f9" strokeWidth="0.04" />

                        {recipes.map((r, i) => {
                            const sliceAngle = 360 / recipes.length;
                            const startAngle = i * sliceAngle;
                            const endAngle = (i + 1) * sliceAngle;

                            // SVG arc path
                            const startX = Math.cos(startAngle * Math.PI / 180);
                            const startY = Math.sin(startAngle * Math.PI / 180);
                            const endX = Math.cos(endAngle * Math.PI / 180);
                            const endY = Math.sin(endAngle * Math.PI / 180);

                            const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                            const pathData = [
                                `M 0 0`,
                                `L ${startX} ${startY}`,
                                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // sweep flag 1 for clockwise
                                `Z`
                            ].join(" ");

                            return (
                                <g key={r.id}>
                                    <path
                                        d={pathData}
                                        fill={i % 2 === 0 ? "#f97316" : "#fbbf24"}
                                        stroke="#fff"
                                        strokeWidth="0.01"
                                    />
                                    {/* Text: positioned at mid-angle, pushed out 0.7 radius */}
                                    <text
                                        x={Math.cos((startAngle + sliceAngle / 2) * Math.PI / 180) * 0.75}
                                        y={Math.sin((startAngle + sliceAngle / 2) * Math.PI / 180) * 0.75}
                                        fill="#fff"
                                        fontSize="0.08"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        style={{
                                            textTransform: "uppercase",
                                            transform: `rotate(${startAngle + sliceAngle / 2}deg)`,
                                            transformBox: "fill-box",
                                            transformOrigin: "center",
                                            textShadow: "0 0 2px rgba(0,0,0,0.3)"
                                        }}
                                        transform={`rotate(${startAngle + sliceAngle / 2 + 90} ${Math.cos((startAngle + sliceAngle / 2) * Math.PI / 180) * 0.75} ${Math.sin((startAngle + sliceAngle / 2) * Math.PI / 180) * 0.75})`}
                                    >
                                        🎁
                                    </text>
                                </g>
                            );
                        })}

                        {/* Center Knob */}
                        <circle cx="0" cy="0" r="0.15" fill="#fff" stroke="#cbd5e1" strokeWidth="0.02" />
                        <circle cx="0" cy="0" r="0.05" fill="#f97316" />
                    </svg>

                    {/* Fixed Pointer */}
                    <div style={styles.pointer}>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <path d="M20 40L5 10H35L20 40Z" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                        </svg>
                    </div>
                </div>

                {winner ? (
                    <div style={styles.winnerCard}>
                        {!isRevealed ? (
                            <>
                                <div style={styles.winnerConfetti}>🎁</div>
                                <div style={styles.mysteryCircle}>?</div>
                                <h3 style={styles.winnerTitle}>Mystery Dish!</h3>
                                <button
                                    onClick={() => setIsRevealed(true)}
                                    style={styles.revealBtn}
                                >
                                    ✨ REVEAL ✨
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={styles.winnerConfetti}>🎉</div>
                                <img
                                    src={getFoodImage(winner)}
                                    alt={winner.title}
                                    style={styles.winnerImg}
                                    onError={(e) => {
                                        e.target.src = getFallbackImage();
                                    }}
                                />
                                <h3 style={styles.winnerTitle}>{winner.title}</h3>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                    <button
                                        onClick={() => onSelectRecipe(winner)}
                                        style={styles.viewBtn}
                                    >
                                        View Recipe
                                    </button>
                                    <button onClick={spin} style={styles.spinBtnSmall}>
                                        Spin Again
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={spin}
                        disabled={spinning}
                        style={{
                            ...styles.spinBtn,
                            opacity: spinning ? 0.7 : 1,
                            transform: spinning ? "scale(0.95)" : "scale(1)",
                        }}
                    >
                        {spinning ? "Spinning..." : "SPIN!"}
                    </button>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease",
    },
    container: {
        position: "relative",
        width: "90%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    closeBtn: {
        position: "absolute",
        top: "-40px",
        right: "0",
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: "32px",
        cursor: "pointer",
    },
    title: {
        color: "#fff",
        margin: "0 0 4px 0",
        fontSize: "2rem",
        fontWeight: "800",
        textShadow: "0 4px 12px rgba(249,115,22,0.5)",
    },
    subtitle: {
        color: "#94a3b8",
        margin: "0 0 32px 0",
    },
    wheelWrapper: {
        position: "relative",
        width: "320px",
        height: "320px",
        marginBottom: "32px",
        filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))",
    },
    pointer: {
        position: "absolute",
        top: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        fontSize: "40px",
        color: "#ef4444",
        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        pointerEvents: "none",
    },
    spinBtn: {
        background: "linear-gradient(135deg, #f97316, #ef4444)",
        color: "#fff",
        border: "none",
        padding: "16px 48px",
        borderRadius: "100px",
        fontSize: "1.2rem",
        fontWeight: "800",
        cursor: "pointer",
        boxShadow: "0 0 20px rgba(249,115,22,0.4)",
        transition: "all 0.2s",
        letterSpacing: "0.05em",
    },
    winnerCard: {
        textAlign: "center",
        animation: "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        background: "rgba(255,255,255,0.1)",
        padding: "20px",
        borderRadius: "20px",
        width: "100%",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
    },
    winnerImg: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid #fff",
        marginBottom: "12px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
    },
    winnerTitle: {
        color: "#fff",
        margin: "0 0 16px 0",
        fontSize: "1.2rem",
    },
    winnerConfetti: {
        fontSize: "40px",
        position: "absolute",
        top: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
        animation: "wiggle 1s ease-in-out infinite",
    },
    viewBtn: {
        background: "#22c55e",
        color: "#fff",
        border: "none",
        padding: "10px 24px",
        borderRadius: "12px",
        fontWeight: "600",
        cursor: "pointer",
        marginRight: "8px",
    },
    spinBtnSmall: {
        background: "rgba(255,255,255,0.1)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: "10px 20px",
        borderRadius: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },
    mysteryCircle: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #1e293b, #334155)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
        color: "#f97316",
        margin: "0 auto 16px auto",
        border: "3px dashed #f97316",
    },
    revealBtn: {
        background: "linear-gradient(135deg, #f97316, #ef4444)",
        color: "#fff",
        border: "none",
        padding: "12px 32px",
        borderRadius: "12px",
        fontWeight: "800",
        cursor: "pointer",
        fontSize: "1.1rem",
        boxShadow: "0 0 15px rgba(249,115,22,0.4)",
        animation: "scalePulse 1.5s infinite",
    }
};
