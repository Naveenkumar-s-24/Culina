import { useEffect, useState, useRef } from "react";
import { fetchRecipes, fetchCuisines } from "../api/recipesApi";

const TAGLINES = [
    "Discover flavors from around the world",
    "Your personal recipe universe",
    "Cook something amazing today",
    "Explore 1000+ curated recipes",
];

const FOOD_EMOJIS = ["🍕", "🍣", "🌮", "🍜", "🥘", "🍛", "🥐", "🍔", "🥗", "🧁", "🍝", "🫕", "🥙", "🍱", "🧆"];

const MagneticButton = ({ children, onClick, style }) => {
    const btnRef = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = btnRef.current.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPos({ x: x * 0.4, y: y * 0.4 });
    };

    const handleMouseLeave = () => setPos({ x: 0, y: 0 });

    return (
        <button
            ref={btnRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                ...style,
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                transition: pos.x === 0 ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
        >
            {children}
        </button>
    );
};

export default function HeroSection({ onExplore }) {
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [stats, setStats] = useState({ recipes: "1000+", cuisines: "25+", rating: "4.8★" });
    const [particles, setParticles] = useState([]);
    const orbRef = useRef(null);

    useEffect(() => {
        fetchRecipes(1, 1).then(res => {
            if (res.total) setStats(prev => ({ ...prev, recipes: `${res.total}+` }));
        });
        fetchCuisines().then(data => {
            if (Array.isArray(data)) setStats(prev => ({ ...prev, cuisines: `${data.length}+` }));
        });

        const pts = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            left: Math.random() * 100,
            delay: Math.random() * 8,
            duration: 8 + Math.random() * 10,
            size: 20 + Math.random() * 20,
        }));
        setParticles(pts);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
        }, 4000);

        const handleMouseMove = (e) => {
            if (orbRef.current) {
                const x = e.clientX;
                const y = e.clientY;
                orbRef.current.style.transform = `translate3d(${x - 400}px, ${y - 400}px, 0)`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div style={styles.hero}>
            {/* Interactive Spotlight */}
            <div ref={orbRef} style={styles.spotlight} />

            {/* Floating food particles */}
            {particles.map((p) => (
                <span
                    key={p.id}
                    style={{
                        ...styles.particle,
                        left: `${p.left}%`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        fontSize: `${p.size}px`,
                    }}
                >
                    {p.emoji}
                </span>
            ))}

            <div style={styles.content}>
                <div style={styles.premiumBadge}>
                    <span style={styles.badgeLine} />
                    <span>GASTRONOMY REDEFINED // BEYOND TASTE</span>
                    <span style={styles.badgeLine} />
                </div>

                <h1 style={styles.titleContainer}>
                    <div style={styles.line1}>CULINA</div>
                    <div style={styles.line2}>CULINA</div>
                </h1>

                <div style={styles.separator}>
                    <div style={styles.sepLine} />
                    <div style={styles.sepDot} />
                    <div style={styles.sepLine} />
                </div>

                <p key={taglineIndex} style={styles.tagline}>
                    {TAGLINES[taglineIndex]}
                </p>

                <div style={styles.actions}>
                    <MagneticButton
                        onClick={onExplore}
                        style={styles.exploreBtn}
                    >
                        <span>START COOKING</span>
                        <div style={styles.btnGlow} />
                    </MagneticButton>

                    <div style={styles.heroStats}>
                        <div style={styles.statBox}>
                            <span style={styles.statVal}>{stats.recipes}</span>
                            <span style={styles.statLab}>RECIPES</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statVal}>{stats.cuisines}</span>
                            <span style={styles.statLab}>CUISINES</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statVal}>{stats.rating}</span>
                            <span style={styles.statLab}>PRECISION</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    hero: {
        position: "relative",
        minHeight: "650px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "80px 40px",
    },
    particle: {
        position: "absolute",
        bottom: "-60px",
        animation: "particleFloat linear infinite",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.25,
        filter: "blur(2px)",
    },
    spotlight: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "800px",
        height: "800px",
        background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 1,
        filter: "blur(60px)",
        transition: "transform 0.15s ease-out",
    },
    content: {
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        maxWidth: "900px",
    },
    premiumBadge: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "15px",
        color: "#f97316",
        fontSize: "0.7rem",
        fontWeight: 800,
        letterSpacing: "0.4em",
        marginBottom: "32px",
        opacity: 0.8,
        animation: "slideUp 1s var(--transition-base) both",
    },
    badgeLine: {
        width: "40px",
        height: "1px",
        background: "var(--accent-gradient)",
    },
    titleContainer: {
        fontSize: "6.5rem",
        fontWeight: 950,
        color: "#fff",
        lineHeight: 0.85,
        letterSpacing: "-0.06em",
        marginBottom: "40px",
        textTransform: "uppercase",
    },
    line1: {
        animation: "slideUp 1s var(--transition-ultra) both 0.2s",
        background: "linear-gradient(to bottom, #fff, #94a3b8)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    line2: {
        animation: "slideUp 1.2s var(--transition-ultra) both 0.4s",
        color: "transparent",
        WebkitTextStroke: "2px rgba(255,255,255,0.2)",
    },
    separator: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        marginBottom: "40px",
        animation: "fadeIn 2s ease both 0.8s",
    },
    sepLine: {
        width: "100px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
    },
    sepDot: {
        width: "6px",
        height: "6px",
        background: "#f97316",
        borderRadius: "50%",
        boxShadow: "0 0 15px #f97316",
    },
    tagline: {
        fontSize: "1.4rem",
        color: "#94a3b8",
        fontWeight: 300,
        marginBottom: "60px",
        letterSpacing: "0.05em",
        animation: "slideUp 1s var(--transition-base) both 0.6s",
    },
    actions: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "60px",
    },
    exploreBtn: {
        position: "relative",
        padding: "20px 60px",
        background: "#fff",
        border: "none",
        borderRadius: "2px",
        color: "#000",
        fontSize: "0.85rem",
        fontWeight: 900,
        letterSpacing: "0.3em",
        cursor: "pointer",
        overflow: "hidden",
        animation: "slideUp 1s var(--transition-base) both 0.8s",
    },
    btnGlow: {
        position: "absolute",
        inset: 0,
        background: "var(--accent-gradient)",
        opacity: 0,
        transition: "opacity 0.3s ease",
        zIndex: -1,
    },
    heroStats: {
        display: "flex",
        gap: "60px",
        animation: "fadeIn 1.5s ease both 1s",
    },
    statBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    statVal: {
        fontSize: "1.8rem",
        fontWeight: 300,
        color: "#fff",
        letterSpacing: "0.1em",
    },
    statLab: {
        fontSize: "0.6rem",
        fontWeight: 800,
        color: "#475569",
        letterSpacing: "0.15em",
        marginTop: "8px",
    }
};
