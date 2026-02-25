import { useState, useEffect } from "react";
import { sendChatMessage } from "../api/recipesApi";
import { getFoodImageLarge, getCuisineGradient, getFallbackImage } from "../utils/foodImages";
import FlavorRadar from "../components/FlavorRadar";

const DIMENSIONS = [
    { id: "tokyo", name: "Tokyo Dimension", cuisine: "Japanese", icon: "🏮" },
    { id: "mexico", name: "Aztec Highlands", cuisine: "Mexican", icon: "🌵" },
    { id: "paris", name: "Parisian Bistro", cuisine: "French", icon: "🗼" },
    { id: "mumbai", name: "The Curry Verse", cuisine: "Indian", icon: "🕌" },
    { id: "future", name: "Neo-Culina 2126", cuisine: "Cyber-Fusion", icon: "🤖" },
];

export default function ParallelDimension({ recipe, onReturn }) {
    const [selectedDim, setSelectedDim] = useState(null);
    const [shifting, setShifting] = useState(false);
    const [reimagined, setReimagined] = useState(null);
    const [error, setError] = useState(null);

    const handleShift = async (dim) => {
        setSelectedDim(dim);
        setShifting(true);
        setError(null);

        const prompt = `CRITICAL MISSION: You are a Multiversal Chef. Reimagine the recipe "${recipe.title}" (Original: ${recipe.cuisine}) as if it were born in the "${dim.name}" universe (${dim.cuisine} style). 
        Provide:
        1. A new title.
        2. A 2-sentence description of the culinary transition.
        3. 3 Key Multiversal Ingredient swaps (e.g., Parmesean -> Miso).
        4. A theoretical flavor profile shift (sweet, spicy, savory, sour, bitter, umami) as a JSON object.`;

        try {
            const res = await sendChatMessage(prompt);
            // Parse response (assuming CulBot returns a somewhat structured text we can clean)
            // For a "grand" feature, we'll simulate the structured extraction or just display the text heroically.
            setReimagined({
                original: recipe,
                dimension: dim,
                content: res.text || "",
                // Modeled DNA shift
                flavor_profile: shiftDNA(recipe.flavor_profile, dim.id)
            });
        } catch (err) {
            setError("The dimensional barrier is too strong. Try again.");
        } finally {
            setShifting(false);
        }
    };

    const shiftDNA = (original, dimId) => {
        const dna = { ...original };
        if (dimId === 'tokyo') { dna.umami += 40; dna.savory += 20; }
        if (dimId === 'mexico') { dna.spicy += 50; dna.savory += 10; }
        if (dimId === 'future') { dna.bitter += 20; dna.umami += 30; dna.sour += 20; }
        return dna;
    };

    if (reimagined) {
        return (
            <div style={styles.container} className="portal-active">
                <div style={styles.header}>
                    <button onClick={() => setReimagined(null)} style={styles.backBtn}>← ESCAPE DIMENSION</button>
                    <h2 style={styles.multiverseTitle}>MULTIVERSAL REBIRTH</h2>
                </div>

                <div style={styles.mainCard}>
                    <div style={{ ...styles.heroSection, background: getCuisineGradient(reimagined.dimension.cuisine) }}>
                        <img src={getFoodImageLarge(recipe)} alt="Reimagined" style={styles.heroImg} className="multiverse-shift" />
                        <div style={styles.dimensionBadge}>
                            {reimagined.dimension.icon} {reimagined.dimension.name}
                        </div>
                    </div>

                    <div style={styles.content}>
                        <div style={styles.reimaginedText}>
                            {(reimagined.content || "").split('\n').map((line, i) => (
                                <p key={i} style={line.includes(':') ? styles.labelLine : styles.textLine}>{line}</p>
                            ))}
                        </div>

                        <div style={styles.dnaGrid}>
                            <div>
                                <h4 style={styles.dnaTitle}>ORIGINAL DNA</h4>
                                <FlavorRadar recipe={recipe} />
                            </div>
                            <div>
                                <h4 style={styles.dnaTitle}>DIMENSIONAL DNA</h4>
                                <FlavorRadar recipe={{ ...recipe, flavor_profile: reimagined.flavor_profile }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.intro}>
                <h2 style={styles.portalTitle}>DIMENSION PORTAL</h2>
                <p style={styles.portalSubtitle}>Reimagine "{recipe.title}" across the multiverse</p>
            </div>

            <div style={styles.dimGrid}>
                {DIMENSIONS.map(dim => (
                    <div
                        key={dim.id}
                        style={{
                            ...styles.dimCard,
                            opacity: shifting && selectedDim?.id !== dim.id ? 0.3 : 1,
                            transform: shifting && selectedDim?.id === dim.id ? "scale(1.05)" : "scale(1)"
                        }}
                        onClick={() => !shifting && handleShift(dim)}
                    >
                        <span style={styles.dimIcon}>{dim.icon}</span>
                        <span style={styles.dimName}>{dim.name}</span>
                        <span style={styles.dimCuisine}>{dim.cuisine} Origin</span>
                        {shifting && selectedDim?.id === dim.id && (
                            <div style={styles.loadingPulse}>SHIFTING...</div>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={onReturn} style={styles.returnBtn}>RETURN TO REALITY</button>
        </div>
    );
}

const styles = {
    container: {
        padding: "40px",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#fff",
    },
    intro: { textAlign: "center", marginBottom: "60px" },
    portalTitle: { fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0 },
    portalSubtitle: { color: "#94a3b8", fontSize: "1.2rem", fontWeight: 300 },
    dimGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
        width: "100%",
        maxWidth: "1000px",
    },
    dimCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "32px",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    dimIcon: { fontSize: "3.5rem", marginBottom: "16px" },
    dimName: { fontSize: "1.1rem", fontWeight: 800, marginBottom: "4px" },
    dimCuisine: { fontSize: "0.8rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" },
    loadingPulse: { marginTop: "16px", color: "var(--accent)", fontWeight: 900, animation: "pulse 1s infinite" },
    returnBtn: {
        marginTop: "60px",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#64748b",
        padding: "12px 32px",
        borderRadius: "100px",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "0.85rem",
        fontWeight: 600,
    },
    mainCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "32px",
        overflow: "hidden",
        width: "100%",
        maxWidth: "900px",
    },
    heroSection: {
        height: "250px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    heroImg: { width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6) contrast(1.2)" },
    dimensionBadge: {
        position: "absolute",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        padding: "8px 20px",
        borderRadius: "100px",
        fontSize: "1rem",
        fontWeight: 800,
    },
    content: { padding: "40px" },
    reimaginedText: { marginBottom: "40px", padding: "24px", background: "rgba(0,0,0,0.2)", borderRadius: "16px" },
    textLine: { color: "#94a3b8", lineHeight: 1.6, marginBottom: "12px" },
    labelLine: { color: "var(--accent)", fontWeight: 800, textTransform: "uppercase", fontSize: "0.8rem", marginBottom: "4px" },
    dnaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" },
    dnaTitle: { textAlign: "center", color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.2em", marginBottom: "20px" },
    header: { display: "flex", width: "100%", maxWidth: "900px", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    multiverseTitle: { margin: 0, fontSize: "1.2rem", fontWeight: 900, letterSpacing: "0.2em", color: "var(--accent)" },
    backBtn: { background: "none", border: "none", color: "#64748b", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem" }
};
