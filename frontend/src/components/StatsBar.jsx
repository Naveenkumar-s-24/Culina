import { useEffect, useState, useRef } from "react";
import { fetchRecipes, fetchCuisines } from "../api/recipesApi";

function AnimatedCounter({ target, suffix = "", decimals = 0, duration = 1500 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);
    const prevTarget = useRef(target);

    useEffect(() => {
        // Re-animate when target changes
        if (prevTarget.current !== target) {
            started.current = false;
            prevTarget.current = target;
        }
        if (started.current) return;
        started.current = true;

        const startTime = performance.now();
        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * target);
            if (progress < 1) {
                ref.current = requestAnimationFrame(step);
            }
        };
        ref.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(ref.current);
    }, [target, duration]);

    const display = decimals > 0 ? count.toFixed(decimals) : Math.round(count);

    return (
        <span>
            {display}
            {suffix}
        </span>
    );
}

export default function StatsBar() {
    const [totalRecipes, setTotalRecipes] = useState(0);
    const [cuisineCount, setCuisineCount] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [avgTime, setAvgTime] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Fetch all recipes to compute real aggregate stats
        Promise.all([
            fetchRecipes(1, 1),    // Just to get total count
            fetchCuisines(),       // Get unique cuisine list
            fetchRecipes(1, 500),  // Get a large batch for avg calculations
        ])
            .then(([countRes, cuisines, allRes]) => {
                const total = countRes.total || 0;
                setTotalRecipes(total);
                setCuisineCount(cuisines.length);

                const recipes = allRes.data || [];
                if (recipes.length > 0) {
                    const ratingsSum = recipes.reduce((s, r) => s + (r.rating || 0), 0);
                    const ratedCount = recipes.filter((r) => r.rating).length;
                    setAvgRating(ratedCount > 0 ? ratingsSum / ratedCount : 0);

                    const timesSum = recipes.reduce((s, r) => s + (r.total_time || 0), 0);
                    const timedCount = recipes.filter((r) => r.total_time).length;
                    setAvgTime(timedCount > 0 ? Math.round(timesSum / timedCount) : 0);
                }
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, []);

    if (!loaded) {
        return (
            <div style={styles.bar}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ ...styles.stat, ...styles.skeleton }} />
                ))}
            </div>
        );
    }

    const stats = [
        {
            icon: "📊",
            label: "Total Recipes",
            value: totalRecipes,
            suffix: "",
            decimals: 0,
            color: "#f97316",
        },
        {
            icon: "🌍",
            label: "Cuisines",
            value: cuisineCount,
            suffix: "",
            decimals: 0,
            color: "#38bdf8",
        },
        {
            icon: "⭐",
            label: "Avg Rating",
            value: avgRating,
            suffix: "",
            decimals: 1,
            color: "#fbbf24",
        },
        {
            icon: "⏱️",
            label: "Avg Cook Time",
            value: avgTime,
            suffix: " min",
            decimals: 0,
            color: "#22c55e",
        },
    ];

    return (
        <div style={styles.bar}>
            {stats.map((s, i) => (
                <div
                    key={s.label}
                    style={{
                        ...styles.stat,
                        animationDelay: `${i * 0.1}s`,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${s.color}40`;
                        e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    <div style={{ ...styles.iconWrap, background: `${s.color}15` }}>
                        <span style={styles.icon}>{s.icon}</span>
                    </div>
                    <div style={styles.statText}>
                        <span style={{ ...styles.statValue, color: s.color }}>
                            <AnimatedCounter
                                target={s.value}
                                suffix={s.suffix}
                                decimals={s.decimals}
                            />
                        </span>
                        <span style={styles.statLabel}>{s.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    bar: {
        display: "flex",
        gap: "16px",
        marginBottom: "28px",
        flexWrap: "wrap",
    },
    stat: {
        flex: "1 1 140px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 20px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        animation: "slideUp 0.5s ease both",
        transition: "all 0.3s ease",
        cursor: "default",
    },
    skeleton: {
        height: "76px",
        background:
            "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)",
        backgroundSize: "800px 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
    },
    iconWrap: {
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    icon: {
        fontSize: "20px",
    },
    statText: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    statValue: {
        fontSize: "1.25rem",
        fontWeight: 800,
        letterSpacing: "-0.01em",
    },
    statLabel: {
        fontSize: "0.72rem",
        fontWeight: 500,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },
};
