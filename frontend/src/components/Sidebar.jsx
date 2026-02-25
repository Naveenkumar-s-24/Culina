import CookTimeDial from "./CookTimeDial";
import { trackQuestAction } from "./ChefQuest";

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


export default function Sidebar({
  onCuisineSelect,
  activeCuisine,
  onSurprise,
  onMap,
  timeFilter,
  onTimeChange,
  cuisineSearch,
  onCuisineSearchChange,
  onCollider
}) {

  return (
    <aside style={styles.sidebar}>
      {/* Search Bar */}
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search cuisines..."
          style={styles.searchInput}
          value={cuisineSearch}
          onChange={(e) => onCuisineSearchChange(e.target.value)}
        />
        {cuisineSearch && (
          <button
            onClick={() => onCuisineSearchChange("")}
            style={styles.clearBtn}
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div style={styles.navSection}>
        <button
          onClick={() => onCuisineSelect && onCuisineSelect(null)}
          style={{
            ...styles.chip,
            ...(activeCuisine === null ? styles.chipActive : {}),
          }}
        >
          <span>🏠</span>
          <span>Home</span>
        </button>

        <button
          onClick={onMap}
          style={{
            ...styles.chip,
            background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(147,51,234,0.1))",
            borderColor: "rgba(59,130,246,0.2)",
            color: "#60a5fa",
            fontWeight: 600,
          }}
        >
          <span>🗺️</span>
          <span>World Map</span>
        </button>

        <button
          onClick={onSurprise}
          style={{
            ...styles.chip,
            background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(239,68,68,0.1))",
            borderColor: "rgba(249,115,22,0.2)",
            color: "#f97316",
            fontWeight: 600,
          }}
        >
          <span>🎰</span>
          <span>Roulette</span>
        </button>

        <button
          onClick={onCollider}
          style={{
            ...styles.chip,
            background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))",
            borderColor: "rgba(16,185,129,0.2)",
            color: "#10b981",
            fontWeight: 600,
          }}
        >
          <span>⚛️</span>
          <span>AI Collider</span>
        </button>
      </div>

      <div style={styles.divider} />

      {/* Filter Section */}
      <div style={styles.filterSection}>
        <h3 style={styles.sectionLabel}>Time Filter</h3>
        {timeFilter !== undefined && (
          <CookTimeDial
            time={timeFilter}
            onChange={(t) => {
              onTimeChange(t);
              trackQuestAction("FILTER_TIME", t);
            }}
          />
        )
        }
      </div>

      {/* Footer accent */}
      <div style={styles.footer}>
        <div style={styles.footerLine} />
        <p style={styles.footerText}>Powered by Culina API</p>
      </div>
    </aside >
  );
}

const styles = {
  sidebar: {
    width: "260px",
    minHeight: "calc(100vh - 60px)",
    background: "rgba(4, 5, 8, 0.6)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    borderRight: "1px solid var(--border-glass)",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flexShrink: 0,
    boxShadow: "10px 0 50px rgba(0,0,0,0.5)",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    gap: "32px",
    padding: "18px 40px",
    background: "rgba(4, 5, 8, 0.7)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    borderBottom: "1px solid var(--border-glass)",
    boxShadow: "0 10px 50px rgba(0,0,0,0.5)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border-glass)",
    borderRadius: "2px",
    marginBottom: "12px",
    transition: "all 0.3s ease",
  },
  searchIcon: { fontSize: "0.9rem", color: "#64748b" },
  searchInput: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "0.85rem",
    outline: "none",
    width: "100%",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "0.75rem",
    padding: "0 4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s",
  },
  navSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "12px",
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "12px 0",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "14px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    width: "100%",
  },
  chipActive: {
    background: "rgba(249,115,22,0.15)",
    borderColor: "rgba(249,115,22,0.3)",
    color: "#f97316",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(249,115,22,0.1)",
  },
  footer: {
    marginTop: "auto",
    paddingTop: "24px",
  },
  footerLine: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
    marginBottom: "12px",
  },
  footerText: {
    fontSize: "0.7rem",
    color: "#475569",
    textAlign: "center",
    margin: 0,
  },
};
