import { useState } from "react";

export default function MolecularOracle({ ingredients = "Chocolate, Blue Cheese" }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchInsight = async () => {
        setLoading(true);
        try {
            const resp = await fetch(`http://localhost:8000/api/ai/oracle?ingredients=${encodeURIComponent(ingredients)}`);
            const data = await resp.json();
            setReport(data);
        } catch (e) {
            console.error("Oracle failed", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <header style={styles.header}>
                <div style={styles.titleLine}>
                    <span style={styles.icon}>🔬</span>
                    <h3 style={styles.title}>Molecular Oracle</h3>
                </div>
                <p style={styles.subtitle}>Chemical Affinity Reasoning Engine</p>
            </header>

            {!report && !loading && (
                <div style={styles.preLaunch}>
                    <p style={styles.prompt}>Analyze the chemical bonding between the ingredients in this dish.</p>
                    <button onClick={fetchInsight} style={styles.launchBtn}>ACTIVATE ORACLE</button>
                </div>
            )}

            {loading && <div style={styles.loading}>CONSULTING MOLECULAR DATABASE...</div>}

            {report && (
                <div style={styles.reportArea}>
                    <div style={styles.scoreRow}>
                        <div style={styles.scoreCircle}>
                            <span style={styles.scoreNum}>{report.affinity_score}</span>
                            <span style={styles.scoreLabel}>Affinity</span>
                        </div>
                        <div style={styles.summary}>
                            <p style={styles.reason}>{report.reasoning}</p>
                            <div style={styles.compoundTags}>
                                {report.compounds.map(c => (
                                    <span key={c} style={styles.tag}>{c}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={styles.advice}>
                        <span style={styles.adviceIcon}>💡</span>
                        <p style={styles.adviceText}>{report.oracle_advice}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    card: {
        padding: "24px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.05)",
        marginTop: "20px",
    },
    header: { marginBottom: "20px" },
    titleLine: { display: "flex", alignItems: "center", gap: "10px" },
    icon: { fontSize: "1.2rem" },
    title: { fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: 0 },
    subtitle: { fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" },
    preLaunch: { textAlign: "center", padding: "10px 0" },
    prompt: { fontSize: "0.9rem", color: "#94a3b8", marginBottom: "15px" },
    launchBtn: {
        padding: "10px 24px",
        borderRadius: "12px",
        background: "rgba(59,130,246,0.1)",
        border: "1px solid rgba(59,130,246,0.3)",
        color: "#60a5fa",
        fontSize: "0.85rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
    },
    loading: { textAlign: "center", color: "#64748b", fontSize: "0.85rem", padding: "20px 0" },
    reportArea: { animation: "fadeIn 0.4s ease" },
    scoreRow: { display: "flex", gap: "24px", alignItems: "center", marginBottom: "20px" },
    scoreCircle: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        border: "3px solid #60a5fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 20px rgba(59,130,246,0.2)",
    },
    scoreNum: { fontSize: "1.4rem", fontWeight: 800, color: "#fff", lineHeight: 1 },
    scoreLabel: { fontSize: "0.6rem", color: "#64748b", textTransform: "uppercase" },
    summary: { flex: 1 },
    reason: { fontSize: "0.95rem", color: "#cbd5e1", margin: "0 0 10px", lineHeight: 1.5 },
    compoundTags: { display: "flex", gap: "8px" },
    tag: {
        fontSize: "0.7rem",
        padding: "3px 10px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "6px",
        color: "#94a3b8",
    },
    advice: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        background: "rgba(59,130,246,0.05)",
        borderRadius: "12px",
        border: "1px solid rgba(59,130,246,0.1)",
    },
    adviceIcon: { fontSize: "1.1rem" },
    adviceText: { fontSize: "0.85rem", color: "#93c5fd", margin: 0, fontWeight: 500 },
};
