import { getFoodImageLarge, getCuisineGradient, getFallbackImage } from "../utils/foodImages";
import FlavorRadar from "../components/FlavorRadar";
import MolecularOracle from "../components/MolecularOracle";
import FreshnessGuardian from "../components/FreshnessGuardian";
import { useState, useEffect } from "react";

export default function RecipeDetails({ recipe, onBack, onShift }) {
    if (!recipe) return null;

    // Parse nutrients if it's a string
    let nutrients = recipe.nutrients;
    if (typeof nutrients === "string") {
        try {
            nutrients = JSON.parse(nutrients);
        } catch {
            nutrients = null;
        }
    }

    return (
        <div style={styles.container}>
            {/* Back button */}
            <button
                onClick={onBack}
                style={styles.backBtn}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
            >
                ← Back to recipes
            </button>

            {/* Main detail card */}
            <div style={styles.card}>
                {/* Hero image */}
                <div
                    style={{
                        ...styles.heroImage,
                        background: getCuisineGradient(recipe.cuisine),
                    }}
                >
                    <img
                        src={getFoodImageLarge(recipe)}
                        alt={recipe.title}
                        style={styles.heroImg}
                        onError={(e) => {
                            e.target.src = getFallbackImage();
                        }}
                    />
                    <div style={styles.heroOverlay} />
                    {/* Floating badges on image */}
                    <div style={styles.heroBadges}>
                        <span style={styles.heroCuisine}>{recipe.cuisine}</span>
                        {recipe.rating && (
                            <span style={styles.heroRating}>
                                ⭐ {Number(recipe.rating).toFixed(1)}
                            </span>
                        )}
                        <button
                            onClick={() => onShift(recipe)}
                            style={styles.shiftBtn}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                                e.currentTarget.style.boxShadow = "0 0 30px var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 0 15px rgba(249,115,22,0.3)";
                            }}
                        >
                            🌀 DIMENSIONAL SHIFT
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {/* Title */}
                    <h1 style={styles.title}>{recipe.title}</h1>

                    {/* Info chips */}
                    <div style={styles.infoGrid}>
                        {recipe.prep_time != null && (
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>🔪</span>
                                <span style={styles.infoLabel}>Prep Time</span>
                                <span style={styles.infoValue}>{recipe.prep_time} min</span>
                            </div>
                        )}
                        {recipe.cook_time != null && (
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>🍳</span>
                                <span style={styles.infoLabel}>Cook Time</span>
                                <span style={styles.infoValue}>{recipe.cook_time} min</span>
                            </div>
                        )}
                        {recipe.total_time != null && (
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>⏱️</span>
                                <span style={styles.infoLabel}>Total Time</span>
                                <span style={styles.infoValue}>{recipe.total_time} min</span>
                            </div>
                        )}
                        {recipe.serves && (
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>👥</span>
                                <span style={styles.infoLabel}>Serves</span>
                                <span style={styles.infoValue}>{recipe.serves}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {recipe.description && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>📖 Description</h3>
                            <p style={styles.description}>{recipe.description}</p>
                        </div>
                    )}

                    {/* Nutrients */}
                    {nutrients && typeof nutrients === "object" && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>🥗 Nutrition Facts</h3>
                            <div style={styles.nutrientGrid}>
                                {Object.entries(nutrients).map(([key, value]) => (
                                    <div key={key} style={styles.nutrientPill}>
                                        <span style={styles.nutrientKey}>
                                            {key.replace(/_/g, " ")}
                                        </span>
                                        <span style={styles.nutrientValue}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Flavor Profile */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>🧬 Flavor Profile</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <FlavorRadar recipe={recipe} />
                            <FlavorChronology recipeId={recipe.id} />
                        </div>
                    </div>

                    {/* AI Insights - Oracle & Freshness */}
                    <div style={styles.aiGrid}>
                        <MolecularOracle ingredients={recipe.description} />
                        <FreshnessGuardian recipeId={recipe.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FlavorChronology({ recipeId }) {
    const [data, setData] = useState(null);
    const [hour, setHour] = useState(0);

    useEffect(() => {
        async function load() {
            try {
                const resp = await fetch(`http://localhost:8000/api/ai/chronology/${recipeId}`);
                const result = await resp.json();
                setData(result);
            } catch (e) {
                console.error("Chronology failed", e);
            }
        }
        load();
    }, [recipeId]);

    if (!data) return null;

    const currentPoint = data.timeline.reduce((prev, curr) => {
        return (Math.abs(curr.hour - hour) < Math.abs(prev.hour - hour)) ? curr : prev;
    });

    return (
        <div style={styles.chronoCard}>
            <header style={styles.chronoHeader}>
                <span style={styles.chronoIcon}>⏳</span>
                <span style={styles.chronoTitle}>Predictive Flavor Chronology</span>
            </header>

            <div style={styles.sliderContainer}>
                <input
                    type="range"
                    min="0"
                    max="48"
                    value={hour}
                    onChange={(e) => setHour(parseInt(e.target.value))}
                    style={styles.slider}
                />
                <div style={styles.timeMarkers}>
                    <span>0h</span>
                    <span>12h</span>
                    <span>24h</span>
                    <span>48h</span>
                </div>
            </div>

            <div style={styles.chronoStatus}>
                <div style={styles.statusRow}>
                    <span style={styles.hourBadge}>{hour}H</span>
                    <span style={styles.statusLabel}>{currentPoint.status}</span>
                </div>
                <p style={styles.chronoDesc}>{currentPoint.description}</p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        animation: "slideInRight 0.4s ease both",
        maxWidth: "800px",
    },
    backBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "10px 18px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        color: "#94a3b8",
        fontSize: "0.88rem",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        cursor: "pointer",
        transition: "all 0.2s",
        marginBottom: "20px",
    },
    card: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    },
    heroImage: {
        position: "relative",
        width: "100%",
        height: "280px",
        overflow: "hidden",
    },
    heroImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    },
    heroOverlay: {
        position: "absolute",
        inset: 0,
        background:
            "linear-gradient(to top, rgba(15,17,23,0.85) 0%, rgba(15,17,23,0.2) 40%, transparent 100%)",
        pointerEvents: "none",
    },
    heroBadges: {
        position: "absolute",
        bottom: "16px",
        left: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        zIndex: 2,
    },
    heroCuisine: {
        fontSize: "0.82rem",
        fontWeight: 700,
        color: "#fff",
        background: "rgba(249,115,22,0.8)",
        padding: "6px 16px",
        borderRadius: "100px",
        letterSpacing: "0.02em",
        backdropFilter: "blur(8px)",
    },
    heroRating: {
        fontSize: "0.9rem",
        fontWeight: 700,
        color: "#fbbf24",
        background: "rgba(0,0,0,0.4)",
        padding: "6px 14px",
        borderRadius: "100px",
        backdropFilter: "blur(8px)",
    },
    shiftBtn: {
        background: "var(--accent-gradient)",
        border: "none",
        color: "#fff",
        padding: "8px 24px",
        borderRadius: "100px",
        fontSize: "0.75rem",
        fontWeight: 900,
        letterSpacing: "0.1em",
        cursor: "pointer",
        marginLeft: "auto",
        boxShadow: "0 0 15px rgba(249,115,22,0.3)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    content: {
        padding: "28px 32px 32px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    title: {
        margin: 0,
        fontSize: "1.75rem",
        fontWeight: 800,
        color: "#f1f5f9",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "12px",
    },
    infoCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "16px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        transition: "all 0.2s",
    },
    infoIcon: {
        fontSize: "20px",
    },
    infoLabel: {
        fontSize: "0.7rem",
        fontWeight: 600,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    },
    infoValue: {
        fontSize: "1rem",
        fontWeight: 700,
        color: "#f1f5f9",
    },
    section: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    sectionTitle: {
        margin: 0,
        fontSize: "0.95rem",
        fontWeight: 700,
        color: "#f1f5f9",
    },
    description: {
        margin: 0,
        fontSize: "0.92rem",
        color: "#94a3b8",
        lineHeight: 1.7,
    },
    nutrientGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
    },
    nutrientPill: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 14px",
        background: "rgba(56,189,248,0.08)",
        border: "1px solid rgba(56,189,248,0.15)",
        borderRadius: "100px",
    },
    nutrientKey: {
        fontSize: "0.78rem",
        fontWeight: 500,
        color: "#94a3b8",
        textTransform: "capitalize",
    },
    nutrientValue: {
        fontSize: "0.82rem",
        fontWeight: 700,
        color: "#38bdf8",
    },
    aiGrid: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "20px",
    },
    chronoCard: {
        background: "rgba(255,255,255,0.03)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.05)",
    },
    chronoHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
    chronoIcon: { fontSize: "1.2rem" },
    chronoTitle: { fontSize: "0.85rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
    sliderContainer: { marginBottom: "20px" },
    slider: {
        width: "100%",
        accentColor: "#f97316",
        cursor: "pointer",
        marginBottom: "8px",
    },
    timeMarkers: { display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#475569", fontWeight: 700 },
    chronoStatus: {
        padding: "15px",
        background: "rgba(255,255,255,0.02)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.05)",
    },
    statusRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" },
    hourBadge: {
        background: "rgba(249,115,22,0.1)",
        color: "#f97316",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: 800,
    },
    statusLabel: { fontSize: "0.9rem", fontWeight: 700, color: "#fff", textTransform: "uppercase" },
    chronoDesc: { fontSize: "0.85rem", color: "#94a3b8", margin: 0, lineHeight: 1.5 },
};
