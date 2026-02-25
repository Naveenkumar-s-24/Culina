import { useState, useEffect } from "react";
import { useChefQuest, LEVEL_THRESHOLDS, BADGES } from "../components/ChefQuest";
import { fetchRecipes, fetchCuisines } from "../api/recipesApi";
import { getFoodImage, getCuisineGradient, getFallbackImage } from "../utils/foodImages";
import FlavorRadar from "../components/FlavorRadar";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Profile({ onClose, onSelectRecipe }) {
    const stats = useChefQuest();
    const [favorites, setFavorites] = useState([]);

    const scrollRef = useScrollReveal({ once: true }, [favorites]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("culina_favs") || "[]");
        setFavorites(stored);
    }, []);

    const currentLevelXP = LEVEL_THRESHOLDS[stats.level - 1] || 0;
    const nextLevelXP = LEVEL_THRESHOLDS[stats.level] || 10000;
    const progress = ((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    // "Heavy Feature": Smart Flavor DNA Analyzer
    const aggregateFlavorDNA = () => {
        if (favorites.length === 0) return null;
        const dna = { sweet: 0, spicy: 0, savory: 0, sour: 0, bitter: 0, umami: 0 };
        favorites.forEach(f => {
            const profile = typeof f.flavor_profile === 'string' ? JSON.parse(f.flavor_profile) : f.flavor_profile;
            if (profile) {
                Object.keys(dna).forEach(key => { dna[key] += (profile[key] || 0); });
            }
        });
        Object.keys(dna).forEach(key => { dna[key] = dna[key] / favorites.length; });
        return { flavor_profile: dna, title: "Your Flavor DNA" };
    };

    const flavorDNA = aggregateFlavorDNA();

    return (
        <div style={styles.container} className="entrance-stagger">
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>CHEF COMMAND</h2>
                    <p style={styles.subtitle}>Culinary Identity & Progress Tracking</p>
                </div>
                <button
                    onClick={onClose}
                    style={styles.closeBtn}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--accent)";
                        e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(249,115,22,0.1)";
                        e.currentTarget.style.color = "var(--accent)";
                    }}
                >
                    EXIT HUB
                </button>
            </div>

            <div style={styles.dashboardGrid}>
                {/* User Identity Column */}
                <div style={styles.leftCol}>
                    <div style={styles.profileCard}>
                        <div style={styles.avatarSection}>
                            <div style={styles.avatar}>👨‍🍳</div>
                            <div style={styles.levelBadge}>Level {stats.level}</div>
                        </div>

                        <div style={styles.xpSection}>
                            <div style={styles.xpInfo}>
                                <span style={styles.xpLabel}>GASTRONOMIC RANK</span>
                                <span style={styles.xpVal}>{stats.xp} / {nextLevelXP} XP</span>
                            </div>
                            <div style={styles.progressBarBg}>
                                <div
                                    style={{
                                        ...styles.progressBarFill,
                                        width: `${Math.min(100, Math.max(0, progress))}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    {flavorDNA && (
                        <div style={styles.analyticsCard}>
                            <h3 style={styles.cardTitle}>🧬 SENSORY DNA PROFILER</h3>
                            <div style={styles.radarContainer}>
                                <FlavorRadar recipe={flavorDNA} />
                            </div>
                            <div style={styles.palateAnalysis}>
                                <span style={styles.palateLabel}>PERSONALITY TYPE:</span>
                                <span style={styles.palateValue}>
                                    {Object.entries(flavorDNA.flavor_profile)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 2)
                                        .map(([k]) => k.toUpperCase())
                                        .join(" & ")}
                                </span>
                            </div>
                            <p style={styles.analyticsNote}>
                                Predictive modeling based on {favorites.length} gastronomic records.
                            </p>
                            <div style={styles.dnaBadge}>AI VERIFIED</div>
                        </div>
                    )}
                </div>

                {/* Activity & Favorites Column */}
                <div style={styles.rightCol}>
                    {/* Activity Heatmap (Modeled) */}
                    <div style={styles.heatmapCard}>
                        <h3 style={styles.cardTitle}>🔥 EXPLORATION ACTIVITY</h3>
                        <div style={styles.heatmapGrid}>
                            {Array.from({ length: 52 }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.heatmapCell,
                                        opacity: i % 7 === 0 ? 0.8 : i % 3 === 0 ? 0.4 : 0.1,
                                        background: i % 7 === 0 ? "var(--accent)" : "#fff"
                                    }}
                                    title={`Day ${i}: Activity Recorded`}
                                />
                            ))}
                        </div>
                        <div style={styles.heatmapLegend}>
                            <span>Less</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <div style={{ ...styles.heatmapCell, opacity: 0.1, background: "#fff" }} />
                                <div style={{ ...styles.heatmapCell, opacity: 0.4, background: "#fff" }} />
                                <div style={{ ...styles.heatmapCell, opacity: 0.8, background: "var(--accent)" }} />
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    {/* Favorites Hub */}
                    <div style={styles.favoritesSection}>
                        <h3 style={styles.cardTitle}>💖 FAVORITES HUB ({favorites.length})</h3>
                        {favorites.length === 0 ? (
                            <div style={styles.emptyFavs}>
                                <span style={styles.emptyIcon}>⭐</span>
                                <p style={{ margin: 0 }}>Your culinary collection is empty. Start favoriting recipes!</p>
                            </div>
                        ) : (
                            <div style={styles.favGallery} ref={scrollRef}>
                                {favorites.map((f, i) => (
                                    <div
                                        key={f.id}
                                        onClick={() => onSelectRecipe(f)}
                                        className="scroll-reveal"
                                        style={{
                                            ...styles.favCard,
                                            transitionDelay: `${(i % 5) * 0.1}s`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-5px)";
                                            e.currentTarget.style.borderColor = "var(--accent)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                                        }}
                                    >
                                        <div style={{ ...styles.favImgBox, background: getCuisineGradient(f.cuisine) }}>
                                            <img src={getFoodImage(f, 200)} alt={f.title} style={styles.favImg} />
                                        </div>
                                        <div style={styles.favInfo}>
                                            <span style={styles.favTitle}>{f.title}</span>
                                            <span style={styles.favCuisine}>{f.cuisine}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <h3 style={styles.sectionTitle}>🏆 GASTRONOMIC ACHIEVEMENTS</h3>
            <div style={styles.badgeGrid}>
                {BADGES.map(badge => {
                    const isUnlocked = stats.badges.includes(badge.id);
                    return (
                        <div
                            key={badge.id}
                            style={{
                                ...styles.badgeCard,
                                opacity: isUnlocked ? 1 : 0.4,
                                background: isUnlocked ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                                borderColor: isUnlocked ? "rgba(249,115,22,0.3)" : "transparent"
                            }}
                        >
                            <div style={styles.badgeIcon}>{badge.icon}</div>
                            <div style={styles.badgeName}>{badge.name}</div>
                            <div style={styles.badgeDesc}>{badge.desc}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#fff",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
    },
    title: {
        fontSize: "2.2rem",
        fontWeight: "900",
        margin: 0,
        letterSpacing: "-0.04em",
        color: "#fff",
    },
    subtitle: {
        margin: "4px 0 0 0",
        color: "#94a3b8",
        fontSize: "0.85rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
    },
    closeBtn: {
        background: "rgba(249,115,22,0.1)",
        border: "1px solid var(--accent)",
        color: "var(--accent)",
        padding: "10px 24px",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "0.75rem",
        fontWeight: 800,
        letterSpacing: "0.1em",
    },
    dashboardGrid: {
        display: "grid",
        gridTemplateColumns: "350px 1fr",
        gap: "32px",
        marginBottom: "60px",
    },
    leftCol: {
        display: "flex",
        flexDirection: "column",
        gap: "32px",
    },
    rightCol: {
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        minWidth: 0,
    },
    profileCard: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "32px",
        borderRadius: "24px",
        backdropFilter: "blur(20px)",
    },
    avatarSection: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
    },
    avatar: {
        fontSize: "48px",
        background: "rgba(255,255,255,0.05)",
        width: "90px",
        height: "90px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "2px solid var(--accent)",
    },
    levelBadge: {
        background: "var(--accent-gradient)",
        color: "#fff",
        fontWeight: "900",
        padding: "6px 16px",
        borderRadius: "100px",
        fontSize: "0.8rem",
        boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
    },
    xpSection: {
        width: "100%",
    },
    xpInfo: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px",
        fontSize: "0.7rem",
        fontWeight: "800",
        letterSpacing: "0.05em",
    },
    xpLabel: { color: "#64748b" },
    xpVal: { color: "#f8fafc" },
    progressBarBg: {
        height: "8px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "100px",
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        background: "var(--accent-gradient)",
        borderRadius: "100px",
        transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    analyticsCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "24px",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    cardTitle: {
        fontSize: "0.8rem",
        fontWeight: 800,
        color: "#94a3b8",
        letterSpacing: "0.1em",
        margin: 0,
        textTransform: "uppercase",
    },
    radarContainer: {
        height: "250px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    analyticsNote: {
        margin: "12px 0 0 0",
        fontSize: "0.75rem",
        color: "#475569",
        textAlign: "center",
        lineHeight: 1.5,
    },
    palateAnalysis: {
        background: "rgba(249,115,22,0.1)",
        padding: "16px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        border: "1px solid rgba(249,115,22,0.2)",
    },
    palateLabel: {
        fontSize: "0.65rem",
        fontWeight: 800,
        color: "var(--accent)",
        letterSpacing: "0.1em",
    },
    palateValue: {
        fontSize: "1.1rem",
        fontWeight: 900,
        color: "#fff",
        letterSpacing: "0.05em",
    },
    heatmapCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "24px",
        borderRadius: "24px",
    },
    heatmapGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(13, 1fr)",
        gap: "8px",
        marginTop: "16px",
    },
    heatmapCell: {
        aspectRatio: "1/1",
        borderRadius: "3px",
        transition: "all 0.3s ease",
    },
    heatmapLegend: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "12px",
        marginTop: "16px",
        fontSize: "0.7rem",
        color: "#475569",
        fontWeight: 600,
    },
    favoritesSection: {
        flex: 1,
        minWidth: 0,
    },
    favGallery: {
        display: "flex",
        gap: "16px",
        overflowX: "auto",
        padding: "16px 0",
        scrollbarWidth: "none",
    },
    favCard: {
        minWidth: "160px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    favImgBox: {
        height: "100px",
        overflow: "hidden",
    },
    favImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.8,
    },
    favInfo: {
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    favTitle: {
        fontSize: "0.85rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    favCuisine: {
        fontSize: "0.7rem",
        color: "#64748b",
        fontWeight: 600,
    },
    emptyFavs: {
        padding: "40px",
        textAlign: "center",
        color: "#475569",
        fontSize: "0.9rem",
    },
    sectionTitle: {
        fontSize: "1rem",
        fontWeight: 800,
        color: "#fff",
        letterSpacing: "0.1em",
        marginBottom: "24px",
        opacity: 0.5,
    },
    badgeGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
    },
    badgeCard: {
        border: "1px solid transparent",
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backdropFilter: "blur(10px)",
    },
    badgeIcon: { fontSize: "40px", marginBottom: "12px" },
    badgeName: { color: "#fff", fontWeight: "900", fontSize: "1.1rem", marginBottom: "4px", letterSpacing: "-0.02em" },
    badgeDesc: { color: "#64748b", fontSize: "0.85rem", fontWeight: 500, lineHeight: 1.5 },
    dnaBadge: {
        marginTop: "12px",
        textAlign: "center",
        fontSize: "0.6rem",
        fontWeight: 900,
        color: "#10b981",
        background: "rgba(16,185,129,0.1)",
        padding: "4px 10px",
        borderRadius: "4px",
        letterSpacing: "0.15em",
        alignSelf: "center",
        border: "1px solid rgba(16,185,129,0.2)",
    },
};
