import { useState, useEffect, useRef } from "react";

export default function Header({ onSearch, onProfile, onToggleChat }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(query.trim());
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, onSearch]);

  return (
    <header style={styles.header}>
      {/* Background glow accent */}
      <div style={styles.glowOrb} />

      {/* Logo */}
      <div style={styles.logoWrap}>
        <span style={styles.logoIcon}>🍽️</span>
        <h1 style={styles.logoText}>Culina</h1>
      </div>

      {/* Search */}
      <div
        style={{
          ...styles.searchWrap,
          ...(focused ? styles.searchWrapFocused : {}),
        }}
      >
        <svg
          style={{
            ...styles.searchIcon,
            color: focused ? "#f97316" : "#64748b",
          }}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search recipes by name..."
          style={styles.searchInput}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={styles.clearBtn}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div style={styles.headerRight}>
        <button
          onClick={onToggleChat}
          style={styles.chatbotLauncher}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={styles.botEmoji}>🧠</span>
          <span style={styles.botBadge}>AI</span>
        </button>

        <button onClick={onProfile} style={styles.profileBtn}>
          👤 Profile
        </button>
      </div>

      {/* Right side accent */}
      <div style={styles.navRight}>
        <div style={styles.statusDot} />
        <span style={styles.statusText}>API Connected</span>
      </div>
    </header>
  );
}

const styles = {
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
  glowOrb: {
    position: "absolute",
    top: "-40px",
    left: "120px",
    width: "200px",
    height: "100px",
    background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
    cursor: "pointer",
  },
  logoIcon: {
    fontSize: "28px",
    animation: "float 3s ease-in-out infinite",
  },
  logoText: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #f97316, #fb923c, #fbbf24)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.02em",
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flex: 1,
    maxWidth: "520px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    padding: "0 14px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  searchWrapFocused: {
    background: "rgba(255,255,255,0.1)",
    borderColor: "rgba(249,115,22,0.5)",
    boxShadow: "0 0 24px rgba(249,115,22,0.15)",
  },
  searchIcon: {
    flexShrink: 0,
    transition: "color 0.3s",
  },
  searchInput: {
    flex: 1,
    padding: "12px",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f1f5f9",
    fontSize: "0.95rem",
    fontFamily: "'Inter', sans-serif",
  },
  clearBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    transition: "all 0.2s",
    flexShrink: 0,
  },
  headerRight: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  chatbotLauncher: {
    position: "relative",
    background: "rgba(249, 115, 22, 0.1)",
    border: "1px solid rgba(249, 115, 22, 0.2)",
    padding: "6px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "float 3s ease-in-out infinite",
  },
  botEmoji: {
    fontSize: "18px",
  },
  botBadge: {
    background: "#f97316",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: "bold",
    padding: "1px 5px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  profileBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "100px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 8px rgba(34,197,94,0.5)",
    animation: "pulse 2s ease-in-out infinite",
  },
  statusText: {
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: 500,
  },
};
