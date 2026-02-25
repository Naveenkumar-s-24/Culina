import { useEffect, useState } from "react";

// Generate deterministic flavor profile based on recipe data
// Since we don't have real "flavor" data, we'll hash the title/ingredients 
// and use nutrients to bias the values (e.g. sugar -> sweet)
function generateFlavorProfile(recipe) {
    const { title, nutrients } = recipe;

    // Helper to hash string to 0-1
    const hash = (str) => {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        }
        return Math.abs(h % 100) / 100;
    };

    // Bias based on nutrients if available
    // e.g., Carbs/Sugar -> Sweet
    // Sodium -> Savory
    // Fat -> Rich

    // Base random values from title hash
    let spicy = hash(title + "spicy");
    let sweet = hash(title + "sweet");
    let savory = hash(title + "savory");
    let rich = hash(title + "rich");
    let tangy = hash(title + "tangy");
    let complex = 0.5 + (hash(title + "complex") * 0.5); // Always somewhat complex

    // Adjust if we have nutrient text (e.g. "10g sugar")
    if (nutrients?.length) {
        const nutrientText = nutrients.join(" ").toLowerCase();
        if (nutrientText.includes("sugar") || nutrientText.includes("carb")) sweet += 0.3;
        if (nutrientText.includes("fat")) rich += 0.3;
        if (nutrientText.includes("sodium") || nutrientText.includes("salt")) savory += 0.3;
    }

    // Cuisine bias
    const cuisine = recipe.cuisine?.toLowerCase() || "";
    if (cuisine.includes("indian") || cuisine.includes("thai") || cuisine.includes("mexican")) spicy += 0.4;
    if (cuisine.includes("japanese") || cuisine.includes("french")) savory += 0.3;
    if (cuisine.includes("american")) rich += 0.3;

    // Clamp all to 0.2 - 1.0 (so chart looks full)
    const clamp = (v) => Math.min(Math.max(v, 0.2), 1.0);

    return {
        Spicy: clamp(spicy),
        Sweet: clamp(sweet),
        Savory: clamp(savory),
        Rich: clamp(rich),
        Tangy: clamp(tangy),
        Complex: clamp(complex),
    };
}

export default function FlavorRadar({ recipe }) {
    const [data, setData] = useState(null);
    const [animProgress, setAnimProgress] = useState(0);

    useEffect(() => {
        if (recipe) {
            setData(generateFlavorProfile(recipe));
            setAnimProgress(0);
            setTimeout(() => setAnimProgress(1), 100);
        }
    }, [recipe]);

    if (!data) return null;

    const points = Object.keys(data);
    const totalPoints = points.length;
    const radius = 90; // SVG radius
    const center = { x: 100, y: 100 };

    // Calculate coordinates for a value (0-1) at a specific index
    const getCoords = (value, index) => {
        const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
        return {
            x: center.x + Math.cos(angle) * (radius * value),
            y: center.y + Math.sin(angle) * (radius * value)
        };
    };

    // Generate path string
    const pathData = points.map((key, i) => {
        const val = data[key] * animProgress; // Animate size
        const { x, y } = getCoords(val, i);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ") + " Z";

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Flavor DNA 🧬</h3>
            <div style={styles.chartWrapper}>
                <svg viewBox="0 0 200 200" style={styles.svg}>
                    {/* Grid & Axis Lines */}
                    {points.map((key, i) => {
                        const outer = getCoords(1, i);
                        return (
                            <g key={key}>
                                <line
                                    x1={center.x} y1={center.y}
                                    x2={outer.x} y2={outer.y}
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="1"
                                />
                                <text
                                    x={outer.x}
                                    y={outer.y}
                                    fill="#94a3b8"
                                    fontSize="10"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    style={{
                                        transform: `translate(${Math.cos((Math.PI * 2 * i) / totalPoints - Math.PI / 2) * 15
                                            }px, ${Math.sin((Math.PI * 2 * i) / totalPoints - Math.PI / 2) * 15
                                            }px)`
                                    }}
                                >
                                    {key}
                                </text>
                            </g>
                        );
                    })}

                    {/* Background Polygons (Web) */}
                    {[0.25, 0.5, 0.75, 1].map((scale) => (
                        <path
                            key={scale}
                            d={points.map((_, i) => {
                                const { x, y } = getCoords(scale, i);
                                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                            }).join(" ") + " Z"}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* The Data Shape */}
                    <path
                        d={pathData}
                        fill="rgba(249, 115, 22, 0.4)"
                        stroke="#f97316"
                        strokeWidth="2"
                        style={{ transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                    />

                    {/* Data Points */}
                    {points.map((key, i) => {
                        const val = data[key] * animProgress;
                        const { x, y } = getCoords(val, i);
                        return (
                            <circle
                                key={key}
                                cx={x} cy={y} r="3"
                                fill="#fff"
                                style={{ transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                            />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "rgba(15, 17, 23, 0.6)",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "320px",
    },
    title: {
        margin: "0 0 10px 0",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: "600",
        letterSpacing: "0.05em",
    },
    chartWrapper: {
        width: "100%",
        aspectRatio: "1/1",
    },
    svg: {
        width: "100%",
        height: "100%",
        overflow: "visible",
    }
};
