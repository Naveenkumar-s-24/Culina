import { useEffect, useState } from "react";
import { fetchCuisines } from "../api/recipesApi";
import { getFoodImage, getCuisineGradient, getFallbackImage } from "../utils/foodImages";
import { useScrollReveal } from "../hooks/useScrollReveal";

const CUISINE_EMOJIS = {
    Indian: "🍛",
    Italian: "🍝",
    Chinese: "🥡",
    Japanese: "🍣",
    Mexican: "🌮",
    Thai: "🍜",
    French: "🥐",
    American: "🍔",
    Korean: "🥘",
    Mediterranean: "🫒",
    Greek: "🥗",
    Spanish: "🥘",
    Vietnamese: "🍲",
    Turkish: "🧆",
    Lebanese: "🧆",
    Ethiopian: "🍖",
    Caribbean: "🥥",
    British: "🫖",
    German: "🥨",
    Brazilian: "🥩",
};

function getCuisineEmoji(cuisine) {
    return CUISINE_EMOJIS[cuisine] || "🍴";
}

export default function CuisineGrid({ onSelectCuisine, searchTerm = "" }) {
    const [cuisines, setCuisines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCuisines()
            .then(setCuisines)
            .catch(() => setCuisines([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredCuisines = cuisines.filter(c =>
        c.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const scrollRef = useScrollReveal({ once: true }, [filteredCuisines]);

    if (loading) {
        return (
            <div style={styles.grid}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={styles.skeleton} className="skeleton" />
                ))}
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h3 style={styles.sectionTitle}>
                    {searchTerm ? `Cuisines matching "${searchTerm}"` : "Explore by Cuisine"}
                </h3>
                {searchTerm && (
                    <span style={styles.resultCount}>{filteredCuisines.length} found</span>
                )}
            </div>

            {filteredCuisines.length === 0 ? (
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>🔍</span>
                    <p style={styles.emptyText}>No cuisines found matching your search.</p>
                </div>
            ) : (
                <div style={styles.grid} ref={scrollRef}>
                    {filteredCuisines.map((c, index) => {
                        const bgImage = getFoodImage({ cuisine: c, id: c.length });

                        return (
                            <div
                                key={c}
                                onClick={() => onSelectCuisine(c)}
                                className="scroll-reveal"
                                style={{
                                    ...styles.card,
                                    background: getCuisineGradient(c),
                                    transitionDelay: `${(index % 10) * 0.05}s`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <img
                                    src={bgImage}
                                    alt={c}
                                    style={styles.cardImg}
                                    onError={(e) => {
                                        e.target.src = getFallbackImage();
                                    }}
                                />
                                <div style={styles.cardOverlay} />
                                <div style={styles.cardContent}>
                                    <span style={styles.emoji}>{getCuisineEmoji(c)}</span>
                                    <span style={styles.name}>{c}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        paddingTop: "24px",
        animation: "slideUp 0.6s ease both 0.2s",
    },
    sectionTitle: {
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "0",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px",
    },
    resultCount: {
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "#f97316",
        background: "rgba(249,115,22,0.1)",
        padding: "4px 12px",
        borderRadius: "100px",
    },
    emptyState: {
        padding: "60px 20px",
        textAlign: "center",
        background: "rgba(255,255,255,0.02)",
        borderRadius: "24px",
        border: "1px dashed rgba(255,255,255,0.1)",
    },
    emptyIcon: {
        fontSize: "3rem",
        display: "block",
        marginBottom: "16px",
        opacity: 0.5,
    },
    emptyText: {
        color: "#94a3b8",
        fontSize: "1.1rem",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "16px",
    },
    card: {
        position: "relative",
        height: "180px",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "24px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        border: "1px solid rgba(255,255,255,0.1)",
    },
    cardOverlay: {
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        transition: "background 0.3s ease",
        zIndex: 1,
    },
    cardImg: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.85,
        transition: "transform 0.5s ease",
    },
    cardContent: {
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
    },
    emoji: {
        fontSize: "2.8rem",
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
        transition: "transform 0.3s ease",
    },
    name: {
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "#ffffff",
        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        letterSpacing: "0.02em",
    },
    skeleton: {
        height: "120px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.05)",
    },
};
