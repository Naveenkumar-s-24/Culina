import React, { useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Graticule,
    ZoomableGroup
} from "react-simple-maps";
import { fetchCuisines } from "../api/recipesApi";
import { trackQuestAction } from "./ChefQuest";

// Geographically accurate TopoJSON source
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Comprehensive ID to ISO_A3 Map for world-atlas@2 (Standard TopoJSON)
const ID_TO_ISO = {
    // North America
    "840": "USA", "124": "CAN", "484": "MEX",
    // Europe
    "250": "FRA", "380": "ITA", "826": "GBR", "276": "DEU", "724": "ESP", "300": "GRC",
    "203": "CZE", "040": "AUT", "056": "BEL", "752": "SWE", "578": "NOR", "208": "DNK",
    "528": "NLD", "756": "CHE", "620": "PRT", "616": "POL", "643": "RUS", "348": "HUN",
    // Asia
    "356": "IND", "156": "CHN", "392": "JPN", "764": "THA", "704": "VNM", "410": "KOR",
    "360": "IDN", "608": "PHL", "458": "MYS", "702": "SGP", "792": "TUR", "422": "LBN",
    "376": "ISR", "784": "ARE", "682": "SAU", "586": "PAK", "050": "BGD",
    // South America
    "076": "BRA", "032": "ARG", "604": "PER", "152": "CHL", "170": "COL", "862": "VEN",
    // Africa
    "710": "ZAF", "504": "MAR", "231": "ETH", "566": "NGA", "404": "KEN", "818": "EGY",
    // Oceania
    "036": "AUS", "554": "NZL"
};

const getGeoIso = (geo) => {
    const id = String(geo.id || geo.properties?.id || geo.properties?.iso_n3 || "");
    return ID_TO_ISO[id] || geo.properties?.ISO_A3 || geo.properties?.iso_a3 || geo.properties?.ISO_A2 || "";
};

// Map specific keywords to ISO countries for automated taxonomy
const REGION_KEYWORD_MAP = {
    "USA": ["Southern", "Tex-Mex", "Amish", "New England", "Cajun", "Creole", "Soul Food", "Soul", "Burger", "Barbecue", "BBQ", "American"],
    "IND": ["Indian", "Curry", "Masala", "Tandoori", "Bollywood"],
    "CHN": ["Chinese", "Szechuan", "Cantonese", "Dim Sum", "Wok"],
    "ITA": ["Italian", "Pasta", "Pizza", "Risotto", "Tuscany"],
    "MEX": ["Mexican", "Taco", "Burrito", "Enchilada", "Fajita", "Salsa"],
    "FRA": ["French", "Bistro", "Crepe", "Patisserie"],
    "JPN": ["Japanese", "Sushi", "Ramen", "Teriyaki", "Tempura"],
    "THA": ["Thai", "Pad Thai", "Stir-fry"],
    "GRC": ["Greek", "Mediterranean", "Feta", "Gyros"],
    "ISR": ["Jewish", "Kosher", "Hanukkah", "Passover", "Middle Eastern", "Hummus", "Falafel"],
    "ESP": ["Spanish", "Paella", "Tapas"],
    "GBR": ["English", "British", "Pub", "Scone"],
    "DEU": ["German", "Oktoberfest", "Sausage"],
    "TUR": ["Turkish", "Kebab", "Baklava"],
    "KOR": ["Korean", "Kimchi", "BBQ"],
    "VNM": ["Vietnamese", "Pho"],
    "BRA": ["Brazilian"],
    "PER": ["Peruvian"],
};

function getCuisineMapping(allCuisines) {
    const mapping = {};
    if (!allCuisines || !Array.isArray(allCuisines)) return mapping;

    allCuisines.forEach(cuisine => {
        if (!cuisine) return;
        const lowerC = cuisine.toLowerCase();
        const countries = [];

        Object.entries(REGION_KEYWORD_MAP).forEach(([country, keywords]) => {
            if (keywords.some(k => lowerC.includes(k.toLowerCase())) || lowerC.includes(country.toLowerCase())) {
                countries.push(country);
            }
        });

        // If no match found, default to global categories or USA
        if (countries.length === 0) countries.push("USA");
        mapping[cuisine] = countries;
    });
    return mapping;
}

// Sub-component for better hover handling on buttons
function CuisineButton({ cuisine, onClick }) {
    const [hover, setHover] = useState(false);
    return (
        <button
            style={{
                ...styles.cuisineItem,
                background: hover ? "#f97316" : "rgba(255, 255, 255, 0.05)",
                borderColor: hover ? "#fff" : "rgba(255, 255, 255, 0.1)",
                transform: hover ? "translateY(-2px)" : "none",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {cuisine}
        </button>
    );
}

export default function WorldMap({ onSelectCuisine }) {
    const [regionLookup, setRegionLookup] = useState({});
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let isMounted = true;
        fetchCuisines().then(list => {
            if (!isMounted) return;
            const mapping = getCuisineMapping(list);
            const lookup = {};
            Object.entries(mapping).forEach(([cuisine, countries]) => {
                countries.forEach(code => {
                    if (!lookup[code]) lookup[code] = [];
                    lookup[code].push(cuisine);
                });
            });
            setRegionLookup(lookup);
        }).catch(err => {
            console.error("Map data fetch failed:", err);
            // Default static lookup to ensure the map still works
            setRegionLookup({
                "USA": ["American", "Southern", "Cajun"],
                "IND": ["Indian", "Curry"],
                "CHN": ["Chinese"],
                "MEX": ["Mexican", "Taco"],
                "ITA": ["Italian", "Pasta"],
                "FRA": ["French"]
            });
        });
        return () => { isMounted = false; };
    }, []);

    const handleMouseEnter = (geo, e) => {
        const iso = getGeoIso(geo);
        const name = geo.properties?.name || geo.properties?.NAME || "Country";
        const cuisines = iso ? (regionLookup[iso] || []) : [];

        setHoveredCountry({ name, code: iso, cuisines });
    };

    const handleMouseMove = (e) => {
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredCountry(null);
    };

    const handleCountryClick = (geo) => {
        const iso = getGeoIso(geo);
        const name = geo.properties?.name || geo.properties?.NAME || "Country";
        let cuisines = iso ? regionLookup[iso] : null;

        // Fallback for click if lookup is somehow empty for a known major country
        if (!cuisines && iso === "USA") cuisines = ["Southern Recipes"];
        if (!cuisines && iso === "IND") cuisines = ["Indian"];

        if (cuisines && cuisines.length > 0) {
            setSelectedCountry({ name, cuisines: [...new Set(cuisines)] });
            trackQuestAction("EXPLORE_REGION", name);
        } else {
            console.warn("No cuisines found for:", name, iso);
        }
    };

    return (
        <div style={styles.container}>
            {/* Selection Modal Overly */}
            {selectedCountry && (
                <div style={styles.modalOverlay} onClick={() => setSelectedCountry(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Explore {selectedCountry.name}</h3>
                            <button style={styles.closeBtn} onClick={() => setSelectedCountry(null)}>✕</button>
                        </div>
                        <p style={styles.modalSubtitle}>Select a specific cuisine to view its recipes:</p>
                        <div style={styles.cuisineGrid}>
                            {selectedCountry.cuisines.map(c => (
                                <CuisineButton
                                    key={c}
                                    cuisine={c}
                                    onClick={() => {
                                        onSelectCuisine(c);
                                        setSelectedCountry(null);
                                        trackQuestAction("EXPLORE_CUISINE", c);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Global Culinary Explorer</h2>
                    <p style={styles.subtitle}>Discover the world through its authentic flavors. Click a country to see recipes.</p>
                </div>
                <div style={styles.stats}>
                    <span style={styles.statItem}>🌍 170+ Cuisines</span>
                    <span style={styles.statItem}>📍 8,000+ Recipes</span>
                </div>
            </div>

            <div style={styles.mapWrapper} onMouseMove={handleMouseMove}>
                <ComposableMap
                    projection="geoEqualEarth"
                    projectionConfig={{ scale: 170, center: [0, 10] }}
                    style={styles.svg}
                >
                    <Graticule stroke="rgba(255,255,255,0.05)" />
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const iso = getGeoIso(geo);
                                const hasCuisine = iso && regionLookup[iso];
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={(e) => handleMouseEnter(geo, e)}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={() => handleCountryClick(geo)}
                                        style={{
                                            default: {
                                                fill: hasCuisine ? "#334155" : "#1e293b",
                                                stroke: "rgba(255,255,255,0.1)",
                                                strokeWidth: 0.5,
                                                outline: "none",
                                                transition: "all 0.3s"
                                            },
                                            hover: {
                                                fill: hasCuisine ? "#f97316" : "#475569",
                                                stroke: "#fff",
                                                strokeWidth: 1,
                                                outline: "none",
                                                cursor: hasCuisine ? "pointer" : "default",
                                            },
                                            pressed: {
                                                fill: "#ea580c",
                                                outline: "none",
                                            }
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ComposableMap>

                {/* Custom Tooltip */}
                {hoveredCountry && (
                    <div style={{
                        ...styles.tooltip,
                        left: tooltipPos.x + 15,
                        top: tooltipPos.y + 15,
                    }}>
                        <div style={styles.tooltipName}>{hoveredCountry.name}</div>
                        {hoveredCountry.cuisines.length > 0 ? (
                            <div style={styles.tooltipCuisines}>
                                {hoveredCountry.cuisines.map(c => (
                                    <span key={c} style={styles.cuisineTag}>{c}</span>
                                ))}
                                <div style={styles.tooltipHint}>Click to view recipes</div>
                            </div>
                        ) : (
                            <div style={styles.noCuisine}>No specific regional recipes mapped yet</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "30px",
        background: "linear-gradient(135deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)",
        borderRadius: "32px",
        border: "1px solid rgba(255,255,255,0.05)",
        marginBottom: "30px",
        position: "relative",
        overflow: "hidden",
    },
    modalOverlay: {
        position: "absolute",
        inset: 0,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
    },
    modal: {
        background: "rgba(30, 41, 59, 0.9)",
        border: "1px solid rgba(249, 115, 22, 0.4)",
        borderRadius: "24px",
        padding: "32px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80%",
        overflowY: "auto",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        position: "relative",
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    modalTitle: {
        margin: 0,
        fontSize: "1.5rem",
        color: "#f8fafc",
        fontWeight: 800,
    },
    modalSubtitle: {
        color: "#94a3b8",
        marginBottom: "20px",
        fontSize: "0.95rem",
    },
    closeBtn: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        fontSize: "1.5rem",
        cursor: "pointer",
        padding: "4px",
    },
    cuisineGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "12px",
    },
    cuisineItem: {
        padding: "12px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        color: "#f1f5f9",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.2s ease",
        "&:hover": {
            background: "#f97316",
            borderColor: "#fff",
            transform: "translateY(-2px)",
        }
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "20px",
    },
    title: {
        margin: 0,
        fontSize: "1.8rem",
        fontWeight: 800,
        color: "#f1f5f9",
        letterSpacing: "-0.02em",
    },
    subtitle: {
        margin: "6px 0 0 0",
        color: "#94a3b8",
        fontSize: "0.95rem",
    },
    stats: {
        display: "flex",
        gap: "16px",
    },
    statItem: {
        padding: "8px 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "100px",
        fontSize: "0.85rem",
        color: "#f97316",
        fontWeight: 600,
    },
    mapWrapper: {
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        background: "rgba(0,0,0,0.2)",
        borderRadius: "24px",
        padding: "20px",
    },
    svg: {
        width: "100%",
        height: "auto",
    },
    tooltip: {
        position: "fixed",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(249,115,22,0.3)",
        padding: "12px 16px",
        borderRadius: "16px",
        zIndex: 9999,
        pointerEvents: "none",
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        minWidth: "160px",
    },
    tooltipName: {
        color: "#fff",
        fontWeight: 700,
        fontSize: "1rem",
        marginBottom: "8px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        paddingBottom: "4px",
    },
    tooltipCuisines: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    cuisineTag: {
        color: "#f97316",
        fontSize: "0.85rem",
        fontWeight: 600,
    },
    tooltipHint: {
        fontSize: "0.7rem",
        color: "#64748b",
        marginTop: "4px",
        fontStyle: "italic",
    },
    noCuisine: {
        fontSize: "0.8rem",
        color: "#64748b",
    }
};
