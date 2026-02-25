import { useState, useEffect } from "react";
import { useToast } from "./Toast";

// Gamification System
// Tracks: XP, Level, Badges
// Actions: Visit, Favorite, Spin, Explore Cuisine

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];

export const BADGES = [
    { id: "world_traveler", icon: "🌍", name: "World Traveler", desc: "Explore 5 different cuisines", xp: 100 },
    { id: "critic", icon: "⭐", name: "Food Critic", desc: "View 10 top-rated recipes", xp: 150 },
    { id: "speed_chef", icon: "⚡", name: "Speed Chef", desc: "Find 5 quick recipes (<30m)", xp: 100 },
    { id: "lucky", icon: "🎰", name: "Feeling Lucky", desc: "Spin the roulette 3 times", xp: 50 },
    { id: "devoted", icon: "🔥", name: "Devoted Chef", desc: "Visit 3 days in a row", xp: 200 },
];

export function useChefQuest() {
    const [stats, setStats] = useState({
        xp: 0,
        level: 1,
        badges: [], // list of badge IDs
        cuisinesExplored: [],
        recipesViewed: 0,
        spins: 0,
        quickRecipesFound: 0,
        lastVisit: null,
        streak: 0
    });

    const toast = useToast();

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("culina_quest");
        let initialStats = saved ? JSON.parse(saved) : {
            xp: 0,
            level: 1,
            badges: [],
            cuisinesExplored: [],
            recipesViewed: 0,
            spins: 0,
            quickRecipesFound: 0,
            lastVisit: null,
            streak: 0
        };

        // Check streak
        const today = new Date().toDateString();
        if (initialStats.lastVisit !== today) {
            if (initialStats.lastVisit) {
                const last = new Date(initialStats.lastVisit);
                const diff = (new Date() - last) / (1000 * 60 * 60 * 24);
                if (diff <= 2) {
                    initialStats.streak += 1;
                } else {
                    initialStats.streak = 1;
                }
            } else {
                initialStats.streak = 1;
            }
            initialStats.lastVisit = today;
            initialStats.xp += 10; // Daily login bonus

            // Save immediately
            localStorage.setItem("culina_quest", JSON.stringify(initialStats));

            // Check devoted badge
            if (initialStats.streak >= 3 && !initialStats.badges.includes("devoted")) {
                unlockBadge(initialStats, "devoted");
            }
        }

        setStats(initialStats);

        // Listen for custom events to track actions
        const handleAction = (e) => {
            const { type, data } = e.detail;

            setStats(prev => {
                let newStats = { ...prev };

                if (type === "VIEW_RECIPE") {
                    newStats.recipesViewed += 1;
                    newStats.xp += 5;
                    if (data.rating >= 4.5 && !newStats.badges.includes("critic")) {
                        // Check if viewed 10 top rated (simplified, just counting all views for now as demo)
                        if (newStats.recipesViewed >= 10) unlockBadge(newStats, "critic");
                    }
                } else if (type === "EXPLORE_CUISINE") {
                    if (!newStats.cuisinesExplored.includes(data)) {
                        newStats.cuisinesExplored.push(data);
                        newStats.xp += 10;
                    }
                    if (newStats.cuisinesExplored.length >= 5 && !newStats.badges.includes("world_traveler")) {
                        unlockBadge(newStats, "world_traveler");
                    }
                } else if (type === "SPIN_WHEEL") {
                    newStats.spins += 1;
                    newStats.xp += 15;
                    if (newStats.spins >= 3 && !newStats.badges.includes("lucky")) {
                        unlockBadge(newStats, "lucky");
                    }
                } else if (type === "FILTER_TIME") {
                    if (data < 30) {
                        newStats.quickRecipesFound += 1;
                        newStats.xp += 5;
                        if (newStats.quickRecipesFound >= 5 && !newStats.badges.includes("speed_chef")) {
                            unlockBadge(newStats, "speed_chef");
                        }
                    }
                }

                // Check level up
                // Check next level threshold
                const nextLevelXP = LEVEL_THRESHOLDS[newStats.level];
                if (newStats.xp >= nextLevelXP && newStats.level < 10) {
                    newStats.level += 1;
                    toast.success(`🎉 Level Up! You are now Level ${newStats.level}`);
                }

                localStorage.setItem("culina_quest", JSON.stringify(newStats));
                return newStats;
            });
        };

        window.addEventListener("quest_action", handleAction);
        return () => window.removeEventListener("quest_action", handleAction);
    }, []);

    const unlockBadge = (currentStats, badgeId) => {
        if (currentStats.badges.includes(badgeId)) return;

        currentStats.badges.push(badgeId);
        const badge = BADGES.find(b => b.id === badgeId);
        currentStats.xp += badge.xp;

        toast.success(`🏆 Unlocked: ${badge.name}`);
    };

    return stats;
}

export default function ChefQuest({ onOpenProfile }) {
    const stats = useChefQuest();
    const [isOpen, setIsOpen] = useState(false);

    const currentLevelXP = LEVEL_THRESHOLDS[stats.level - 1] || 0;
    const nextLevelXP = LEVEL_THRESHOLDS[stats.level] || 10000;
    const progress = ((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={styles.toggleBtn}
            >
                <span style={{ fontSize: "1.2rem" }}>🏆</span>
                <span style={styles.levelTag}>Lvl {stats.level}</span>
            </button>

            {/* Quest Panel */}
            {isOpen && (
                <div style={styles.panel}>
                    <div style={styles.header}>
                        <h3 style={styles.title}>Chef Quest</h3>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>×</button>
                    </div>

                    <div style={styles.statsRow}>
                        <div style={styles.statItem}>
                            <span style={styles.statVal}>{stats.level}</span>
                            <span style={styles.statLabel}>Level</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statVal}>{stats.streak}🔥</span>
                            <span style={styles.statLabel}>Day Streak</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statVal}>{stats.xp}</span>
                            <span style={styles.statLabel}>XP</span>
                        </div>
                    </div>

                    <button onClick={onOpenProfile} style={styles.viewProfileBtn}>
                        View Full Profile ↗
                    </button>

                    {/* Progress Bar */}
                    <div style={styles.progressWrap}>
                        <div style={styles.progressLabel}>
                            <span>{stats.xp} / {nextLevelXP} XP</span>
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

                    {/* Badges */}
                    <h4 style={styles.sectionTitle}>Badges</h4>
                    <div style={styles.badgeGrid}>
                        {BADGES.map(badge => {
                            const isUnlocked = stats.badges.includes(badge.id);
                            return (
                                <div
                                    key={badge.id}
                                    style={{
                                        ...styles.badgeCard,
                                        opacity: isUnlocked ? 1 : 0.5,
                                        filter: isUnlocked ? "none" : "grayscale(100%)"
                                    }}
                                >
                                    <div style={styles.badgeIcon}>{badge.icon}</div>
                                    <div style={styles.badgeInfo}>
                                        <div style={styles.badgeName}>{badge.name}</div>
                                        <div style={styles.badgeDesc}>{badge.desc}</div>
                                    </div>
                                    {isUnlocked && <div style={styles.check}>✓</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}

// Helper to dispatch events
export function trackQuestAction(type, data) {
    const event = new CustomEvent("quest_action", { detail: { type, data } });
    window.dispatchEvent(event);
}

const styles = {
    toggleBtn: {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "#fff",
        border: "none",
        borderRadius: "100px",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
        zIndex: 100,
        fontWeight: "700",
        transition: "transform 0.2s",
    },
    viewProfileBtn: {
        width: "100%",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#f1f5f9",
        padding: "8px",
        borderRadius: "8px",
        marginBottom: "16px",
        cursor: "pointer",
        fontSize: "0.85rem",
        transition: "all 0.2s",
    },
    levelTag: {
        fontSize: "0.9rem",
    },
    panel: {
        position: "fixed",
        bottom: "80px",
        right: "24px",
        width: "320px",
        background: "rgba(15, 17, 23, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "20px",
        zIndex: 100,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        animation: "slideUp 0.3s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    title: {
        margin: 0,
        color: "#fff",
        fontSize: "1.2rem",
        fontWeight: "800",
    },
    closeBtn: {
        background: "none",
        border: "none",
        color: "#64748b",
        fontSize: "24px",
        cursor: "pointer",
        padding: "0",
        lineHeight: 1,
    },
    statsRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
        background: "rgba(255,255,255,0.05)",
        padding: "12px",
        borderRadius: "12px",
    },
    statItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
    },
    statVal: {
        color: "#fff",
        fontSize: "1.1rem",
        fontWeight: "700",
    },
    statLabel: {
        color: "#94a3b8",
        fontSize: "0.7rem",
        textTransform: "uppercase",
    },
    progressWrap: {
        marginBottom: "24px",
    },
    progressLabel: {
        display: "flex",
        justifyContent: "flex-end",
        color: "#94a3b8",
        fontSize: "0.75rem",
        marginBottom: "6px",
    },
    progressBarBg: {
        height: "8px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "100px",
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
        borderRadius: "100px",
        transition: "width 0.5s ease",
    },
    sectionTitle: {
        color: "#fff",
        fontSize: "0.9rem",
        marginBottom: "12px",
    },
    badgeGrid: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxHeight: "200px",
        overflowY: "auto",
        paddingRight: "4px",
    },
    badgeCard: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255,255,255,0.05)",
        padding: "10px",
        borderRadius: "12px",
        position: "relative",
    },
    badgeIcon: {
        fontSize: "24px",
    },
    badgeInfo: {
        flex: 1,
    },
    badgeName: {
        color: "#fff",
        fontSize: "0.85rem",
        fontWeight: "600",
    },
    badgeDesc: {
        color: "#94a3b8",
        fontSize: "0.7rem",
    },
    check: {
        color: "#22c55e",
        fontWeight: "bold",
        fontSize: "0.9rem",
    }
};
