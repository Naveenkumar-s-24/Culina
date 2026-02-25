import { useState, useEffect } from "react";

export default function FreshnessGuardian({ recipeId }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const resp = await fetch(`http://localhost:8000/api/ai/freshness/${recipeId}`);
                const data = await resp.json();
                setReport(data);
            } catch (e) {
                console.error("Freshness Guardian failed", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [recipeId]);

    if (loading) return <div style={styles.loading}>SCANNING MOLECULAR DECAY PROFILES...</div>;
    if (!report) return null;

    return (
        <div style={styles.card}>
            <header style={styles.header}>
                <div style={styles.titleLine}>
                    <span style={styles.icon}>🛡️</span>
                    <h3 style={styles.title}>Freshness Guardian</h3>
                </div>
                <p style={styles.subtitle}>Predictive Preservation Intelligence</p>
            </header>

            <div style={styles.gaugeContainer}>
                <div style={styles.gaugeLabel}>FRESHNESS STABILITY</div>
                <div style={styles.gaugeBg}>
                    <div style={{ ...styles.gaugeFill, width: `${report.freshness_gauge}%` }} />
                </div>
                <div style={styles.gaugeValue}>OPTIMAL (100%)</div>
            </div>

            <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                    <span style={styles.statLabel}>FRIDGE LIFE</span>
                    <span style={styles.statVal}>{report.shelf_life.fridge}</span>
                </div>
                <div style={styles.statBox}>
                    <span style={styles.statLabel}>FREEZER LIFE</span>
                    <span style={styles.statVal}>{report.shelf_life.freezer}</span>
                </div>
            </div>

            <div style={styles.strategySection}>
                <h4 style={styles.sectionTitle}>Preservation Strategies</h4>
                <div style={styles.strategies}>
                    {report.preservation_strategies.map((s, i) => (
                        <div key={i} style={styles.strategyItem}>
                            <span style={styles.bullet}>◈</span>
                            <p style={styles.strategyText}>{s}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.risks}>
                <h4 style={styles.sectionTitle}>Key Decay Risks</h4>
                <div style={styles.tagGroup}>
                    {report.risk_factors.map(r => (
                        <span key={r} style={styles.riskTag}>{r}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    card: {
        padding: "24px",
        background: "rgba(16, 185, 129, 0.03)",
        borderRadius: "20px",
        border: "1px solid rgba(16, 185, 129, 0.1)",
        marginTop: "20px",
    },
    header: { marginBottom: "24px" },
    titleLine: { display: "flex", alignItems: "center", gap: "10px" },
    icon: { fontSize: "1.2rem" },
    title: { fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: 0 },
    subtitle: { fontSize: "0.75rem", color: "#10b981", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 },
    loading: { textAlign: "center", color: "#64748b", fontSize: "0.85rem", padding: "20px 0" },
    gaugeContainer: { marginBottom: "24px" },
    gaugeLabel: { fontSize: "0.65rem", fontWeight: 800, color: "#475569", marginBottom: "8px", letterSpacing: "0.05em" },
    gaugeBg: { height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" },
    gaugeFill: { height: "100%", background: "linear-gradient(90deg, #10b981, #34d399)", borderRadius: "10px" },
    gaugeValue: { fontSize: "0.75rem", color: "#10b981", fontWeight: 700, textAlign: "right" },
    statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" },
    statBox: {
        padding: "12px",
        background: "rgba(255,255,255,0.02)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    statLabel: { fontSize: "0.6rem", color: "#64748b", fontWeight: 700 },
    statVal: { fontSize: "0.9rem", color: "#fff", fontWeight: 600 },
    strategySection: { marginBottom: "24px" },
    sectionTitle: { fontSize: "0.8rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" },
    strategies: { display: "flex", flexDirection: "column", gap: "10px" },
    strategyItem: { display: "flex", gap: "10px", alignItems: "flex-start" },
    bullet: { color: "#10b981", fontSize: "0.8rem", marginTop: "2px" },
    strategyText: { fontSize: "0.85rem", color: "#cbd5e1", margin: 0, lineHeight: 1.4 },
    risks: {},
    tagGroup: { display: "flex", flexWrap: "wrap", gap: "8px" },
    riskTag: {
        fontSize: "0.7rem",
        padding: "4px 10px",
        background: "rgba(239, 68, 68, 0.05)",
        border: "1px solid rgba(239, 68, 68, 0.1)",
        borderRadius: "6px",
        color: "#f87171",
        fontWeight: 500,
    },
};
