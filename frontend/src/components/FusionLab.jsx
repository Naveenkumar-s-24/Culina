import { useState, useEffect } from "react";
import { fetchRecipes } from "../api/recipesApi";

export default function FusionLab({ onClose }) {
    const [recipes, setRecipes] = useState([]);
    const [selectionA, setSelectionA] = useState(null);
    const [selectionB, setSelectionB] = useState(null);
    const [isColliding, setIsColliding] = useState(false);
    const [fusedResult, setFusedResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchRecipes(1, 50);
                setRecipes(data.data || []);
            } catch (e) {
                console.error("Failed to load recipes for Collider", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleCollide = async () => {
        if (!selectionA || !selectionB) return;
        setIsColliding(true);
        setFusedResult(null);

        try {
            const resp = await fetch(`http://localhost:8000/api/ai/fuse`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipe_id_a: selectionA.id,
                    recipe_id_b: selectionB.id,
                }),
            });
            const data = await resp.json();

            // Simulate collision delay for "wow" factor
            setTimeout(() => {
                setFusedResult(data);
                setIsColliding(false);
            }, 2000);
        } catch (e) {
            console.error("Collision failed", e);
            setIsColliding(false);
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.titleGroup}>
                    <h1 style={styles.title}>Gastronomic Collider</h1>
                    <p style={styles.subtitle}>AI-Driven Molecular Fusion Engine</p>
                </div>
                <button onClick={onClose} style={styles.closeBtn}>×</button>
            </header>

            <div style={styles.workspace}>
                <div style={styles.selectionZone}>
                    {/* Target A */}
                    <div style={{ ...styles.slot, ...(selectionA ? styles.slotFilled : {}) }}>
                        {!selectionA ? (
                            <p style={styles.slotPlaceholder}>Select Ingredient A</p>
                        ) : (
                            <div style={styles.selectedRecipe}>
                                <span style={styles.selectedIcon}>⚛️</span>
                                <p style={styles.selectedName}>{selectionA.title}</p>
                                <button onClick={() => setSelectionA(null)} style={styles.removeBtn}>Remove</button>
                            </div>
                        )}
                    </div>

                    <div style={styles.collisionCore}>
                        <div style={isColliding ? styles.coreActive : styles.coreIdle}>
                            {isColliding ? "COLLIDING..." : "VS"}
                        </div>
                    </div>

                    {/* Target B */}
                    <div style={{ ...styles.slot, ...(selectionB ? styles.slotFilled : {}) }}>
                        {!selectionB ? (
                            <p style={styles.slotPlaceholder}>Select Ingredient B</p>
                        ) : (
                            <div style={styles.selectedRecipe}>
                                <span style={styles.selectedIcon}>⚛️</span>
                                <p style={styles.selectedName}>{selectionB.title}</p>
                                <button onClick={() => setSelectionB(null)} style={styles.removeBtn}>Remove</button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.actionZone}>
                    <button
                        onClick={handleCollide}
                        disabled={!selectionA || !selectionB || isColliding}
                        style={{
                            ...styles.collideBtn,
                            ...((!selectionA || !selectionB || isColliding) ? styles.btnDisabled : {})
                        }}
                    >
                        {isColliding ? "SYNTHESIZING..." : "INITIATE COLLISION"}
                    </button>
                </div>

                {fusedResult && (
                    <div style={styles.resultZone}>
                        <div style={styles.resultCard}>
                            <div style={styles.resultHeader}>
                                <h2 style={styles.fusedTitle}>{fusedResult.title}</h2>
                                <span style={styles.fusionBadge}>HYBRID DNA</span>
                            </div>
                            <p style={styles.fusedDesc}>{fusedResult.description}</p>

                            <div style={styles.logicSection}>
                                <p style={styles.label}>Fusion Logic:</p>
                                <ul style={styles.logicList}>
                                    {fusedResult.fusion_logic.map((l, i) => (
                                        <li key={i} style={styles.logicItem}>• {l}</li>
                                    ))}
                                </ul>
                            </div>

                            <div style={styles.profileSection}>
                                <p style={styles.label}>Combined Flavor Profile:</p>
                                <div style={styles.profileGrid}>
                                    {Object.entries(fusedResult.combined_profile).map(([key, val]) => (
                                        <div key={key} style={styles.profileBar}>
                                            <div style={styles.barLabel}>{key}</div>
                                            <div style={styles.barContainer}>
                                                <div style={{ ...styles.barFill, width: `${val * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!fusedResult && !isColliding && (
                    <div style={styles.recipeGrid}>
                        <h3 style={styles.gridTitle}>Available Recipes for Fusion</h3>
                        <div style={styles.scrollGrid}>
                            {recipes.map(r => (
                                <div
                                    key={r.id}
                                    style={styles.recipeMiniCard}
                                    onClick={() => {
                                        if (!selectionA) setSelectionA(r);
                                        else if (!selectionB && r.id !== selectionA.id) setSelectionB(r);
                                    }}
                                >
                                    <p style={styles.miniTitle}>{r.title}</p>
                                    <p style={styles.miniCuisine}>{r.cuisine}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "20px",
        color: "#fff",
        background: "rgba(10, 11, 16, 0.4)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        animation: "fadeIn 0.5s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
        padding: "0 10px",
    },
    titleGroup: { display: "flex", flexDirection: "column" },
    title: {
        fontSize: "2.2rem",
        fontWeight: 800,
        margin: 0,
        background: "linear-gradient(90deg, #10b981, #d1fae5)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-0.02em",
    },
    subtitle: { color: "#64748b", margin: "4px 0 0", fontSize: "0.9rem", fontWeight: 500 },
    closeBtn: {
        background: "none",
        border: "none",
        color: "#64748b",
        fontSize: "2rem",
        cursor: "pointer",
        transition: "color 0.2s",
    },
    workspace: { display: "flex", flexDirection: "column", gap: "30px" },
    selectionZone: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "40px 0",
    },
    slot: {
        width: "280px",
        height: "180px",
        borderRadius: "20px",
        border: "2px dashed rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.01)",
        transition: "all 0.3s ease",
    },
    slotFilled: {
        border: "2px solid rgba(16,185,129,0.3)",
        background: "rgba(16,185,129,0.05)",
    },
    slotPlaceholder: { color: "#475569", fontSize: "0.9rem" },
    collisionCore: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    coreIdle: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
        fontWeight: 800,
        color: "#475569",
        border: "1px solid rgba(255,255,255,0.1)",
    },
    coreActive: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "rgba(16,185,129,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        fontWeight: 900,
        color: "#10b981",
        border: "2px solid #10b981",
        boxShadow: "0 0 30px rgba(16,185,129,0.4)",
        animation: "pulse 1s infinite",
    },
    selectedRecipe: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        textAlign: "center",
        padding: "10px",
    },
    selectedIcon: { fontSize: "2rem" },
    selectedName: { fontSize: "1.1rem", fontWeight: 600, margin: 0 },
    removeBtn: {
        background: "none",
        border: "none",
        color: "#ef4444",
        fontSize: "0.75rem",
        cursor: "pointer",
        fontWeight: 600,
    },
    actionZone: { textAlign: "center" },
    collideBtn: {
        padding: "16px 40px",
        borderRadius: "50px",
        background: "linear-gradient(90deg, #059669, #10b981)",
        border: "none",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(16,185,129,0.3)",
        transition: "transform 0.2s, boxShadow 0.2s",
    },
    btnDisabled: {
        background: "#1e293b",
        color: "#475569",
        cursor: "not-allowed",
        boxShadow: "none",
    },
    resultZone: {
        marginTop: "20px",
        animation: "slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
    },
    resultCard: {
        background: "rgba(255,255,255,0.03)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "40px",
    },
    resultHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    fusedTitle: { fontSize: "2.4rem", fontWeight: 800, margin: 0 },
    fusionBadge: {
        background: "rgba(16,185,129,0.2)",
        color: "#10b981",
        padding: "6px 14px",
        borderRadius: "50px",
        fontSize: "0.7rem",
        fontWeight: 800,
        letterSpacing: "0.1em",
    },
    fusedDesc: { fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "30px" },
    label: { fontSize: "0.85rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "15px" },
    logicList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" },
    logicItem: { color: "#cbd5e1", fontSize: "0.95rem" },
    profileSection: { marginTop: "40px" },
    profileGrid: { display: "flex", flexDirection: "column", gap: "15px", maxWidth: "400px" },
    profileBar: { display: "flex", alignItems: "center", gap: "20px" },
    barLabel: { width: "100px", fontSize: "0.8rem", color: "#64748b", textTransform: "capitalize" },
    barContainer: { flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" },
    barFill: { height: "100%", background: "#10b981", borderRadius: "10px" },
    recipeGrid: { marginTop: "20px" },
    gridTitle: { fontSize: "0.9rem", color: "#475569", marginBottom: "15px" },
    scrollGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "12px",
        maxHeight: "300px",
        overflowY: "auto",
        paddingRight: "10px",
    },
    recipeMiniCard: {
        padding: "15px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "14px",
        cursor: "pointer",
        transition: "transform 0.2s, background 0.2s",
    },
    miniTitle: { fontSize: "0.85rem", fontWeight: 600, margin: 0, color: "#f8fafc" },
    miniCuisine: { fontSize: "0.7rem", color: "#64748b", margin: "4px 0 0" },
};
