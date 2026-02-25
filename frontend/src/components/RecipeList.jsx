import { useEffect, useState, useCallback } from "react";
import { searchRecipes, fetchRecipes } from "../api/recipesApi";
import { useToast } from "./Toast";
import StatsBar from "./StatsBar";
import { getFoodImage, getCuisineGradient, getFoodImageLarge, getFallbackImage } from "../utils/foodImages";
import { useScrollReveal } from "../hooks/useScrollReveal";

const SORT_OPTIONS = [
  { value: "rating_desc", label: "⭐ Top Rated" },
  { value: "rating_asc", label: "Rating: Low → High" },
  { value: "time_asc", label: "⏱️ Quickest" },
  { value: "time_desc", label: "Time: Longest" },
  { value: "title_asc", label: "🔤 A → Z" },
  { value: "title_desc", label: "🔤 Z → A" },
];

function sortRecipes(recipes, sortBy) {
  const sorted = [...recipes];
  switch (sortBy) {
    case "rating_desc":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "rating_asc":
      return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    case "time_asc":
      return sorted.sort(
        (a, b) => (a.total_time || 999) - (b.total_time || 999)
      );
    case "time_desc":
      return sorted.sort(
        (a, b) => (b.total_time || 0) - (a.total_time || 0)
      );
    case "title_asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title_desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sorted;
  }
}

export default function RecipeList({
  searchQuery,
  cuisineFilter,
  timeFilter,
  onSelectRecipe,
}) {
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating_desc");
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("culina_favs") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const toast = useToast();
  const limit = 12;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, cuisineFilter, timeFilter]);

  // Fetch data
  const scrollRef = useScrollReveal({ once: true }, [recipes]);

  useEffect(() => {
    setLoading(true);

    // If any filter is active (search, cuisine, or time < 120)
    // We use the search endpoint which supports filtering
    if (searchQuery || cuisineFilter || (timeFilter && timeFilter < 120)) {
      searchRecipes(
        searchQuery || null,
        cuisineFilter || null,
        null,
        timeFilter < 120 ? timeFilter : null
      )
        .then((data) => {
          const arr = Array.isArray(data) ? data : data.data || [];
          setAllRecipes(arr);
          setTotal(arr.length);
        })
        .catch(() => {
          setAllRecipes([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    } else {
      // Otherwise browse all (paginated)
      fetchRecipes(page, limit)
        .then((res) => {
          setAllRecipes(res.data || []);
          setTotal(res.total || 0);
        })
        .catch(() => {
          setAllRecipes([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }
  }, [searchQuery, cuisineFilter, timeFilter, page]);

  // Sort when data or sort option changes
  useEffect(() => {
    if (searchQuery || cuisineFilter || (timeFilter && timeFilter < 120)) {
      const sorted = sortRecipes(allRecipes, sortBy);
      setRecipes(sorted.slice((page - 1) * limit, page * limit));
    } else {
      setRecipes(sortRecipes(allRecipes, sortBy));
    }
  }, [allRecipes, sortBy, page, searchQuery, cuisineFilter]);

  const toggleFavorite = useCallback(
    (e, recipe) => {
      e.stopPropagation();
      setFavorites((prev) => {
        const isFav = prev.some(f => f.id === recipe.id);
        const updated = isFav
          ? prev.filter((f) => f.id !== recipe.id)
          : [...prev, recipe];
        localStorage.setItem("culina_favs", JSON.stringify(updated));

        if (!isFav) {
          toast.success(`Added "${recipe.title}" to favorites ❤️`);
        } else {
          toast.info(`Removed "${recipe.title}" from favorites`);
        }

        return updated;
      });
    },
    [toast]
  );

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Advanced 3D Tilt
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06, 1.06, 1.06)`;

    // Hyper-Luminous Glint
    const glint = card.querySelector('.card-glint');
    if (glint) {
      glint.style.background = `radial - gradient(circle at ${x}px ${y}px, rgba(249, 115, 22, 0.2) 0 %, transparent 60 %)`;
      glint.style.opacity = '1';
    }

    // Volumetric Glow (casts light outward)
    card.style.boxShadow = `${(x - centerX) / 4}px ${(y - centerY) / 4}px 40px rgba(249, 115, 22, 0.2)`;
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1200px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
    card.style.boxShadow = "var(--shadow-md)";
    const glint = card.querySelector('.card-glint');
    if (glint) glint.style.opacity = '0';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={styles.container}>
      {/* Stats bar */}
      {allRecipes.length > 0 && (
        <StatsBar />
      )}

      {/* Section Header with Sort */}
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>
            {searchQuery
              ? `Results for "${searchQuery}"`
              : cuisineFilter
                ? `${cuisineFilter} Recipes`
                : timeFilter < 120
                  ? `Quick Recipes(<${timeFilter} min)`
                  : "🔥 Trending Recipes"}
          </h2>
          <p style={styles.sectionSub}>
            {total} recipe{total !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Sort dropdown */}
        <div style={styles.sortWrap}>
          <button
            style={styles.sortBtn}
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <span>Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
            <span style={{ transform: showSortDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
          </button>
          {showSortDropdown && (
            <div style={styles.sortDropdown}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  style={{
                    ...styles.sortOption,
                    ...(sortBy === opt.value ? styles.sortOptionActive : {}),
                  }}
                  onClick={() => {
                    setSortBy(opt.value);
                    setShowSortDropdown(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ ...styles.skeletonCard, animationDelay: `${i * 0.1} s` }}>
              <div style={{ ...styles.skeletonLine, width: "100%", height: "160px", borderRadius: "12px" }} />
              <div style={{ padding: "12px 0 0 0" }}>
                <div style={{ ...styles.skeletonLine, width: "60%", height: "18px" }} />
                <div style={{ ...styles.skeletonLine, width: "40%", height: "14px", marginTop: "10px" }} />
                <div style={{ ...styles.skeletonLine, width: "90%", height: "14px", marginTop: "8px" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && recipes.length === 0 && (
        <div style={styles.emptyState}>
          <span style={{ ...styles.emptyIcon, animation: "float 3s ease-in-out infinite" }}>🍳</span>
          <h3 style={styles.emptyTitle}>No recipes found</h3>
          <p style={styles.emptyText}>
            Try a different search term or select another cuisine.
          </p>
        </div>
      )}

      {/* Recipe cards */}
      {!loading && recipes.length > 0 && (
        <div style={styles.grid} ref={scrollRef}>
          {recipes.map((r, i) => {
            const isFav = favorites.some(f => f.id === r.id);
            return (
              <div
                key={r.id}
                onClick={() => onSelectRecipe(r)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="scroll-reveal"
                style={{
                  ...styles.card,
                  transitionDelay: `${(i % 12) * 0.05}s`,
                }}
              >
                {/* Food image */}
                <div style={{
                  ...styles.cardImage,
                  background: getCuisineGradient(r.cuisine),
                }}>
                  <img
                    src={getFoodImage(r)}
                    alt={r.title}
                    style={styles.cardImg}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = getFallbackImage();
                    }}
                  />
                  {/* Overlay gradient */}
                  <div style={styles.imgOverlay} />
                </div>

                {/* Card body */}
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={styles.cuisineBadge}>{r.cuisine}</span>
                    <button
                      onClick={(e) => toggleFavorite(e, r)}
                      style={{
                        ...styles.heartBtn,
                        color: isFav ? "#ef4444" : "#4a5568",
                        animation: isFav ? "heartBeat 0.6s ease" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isFav) e.currentTarget.style.color = "#ef4444";
                        e.currentTarget.style.transform = "scale(1.2)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isFav) e.currentTarget.style.color = "#4a5568";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFav ? "❤️" : "🤍"}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 style={styles.cardTitle}>{r.title}</h3>

                  {/* Rating stars */}
                  <div style={styles.ratingRow}>
                    {r.rating ? (
                      <>
                        <div style={styles.stars}>
                          {Array.from({ length: 5 }, (_, idx) => (
                            <span
                              key={idx}
                              style={{
                                color: idx < Math.round(r.rating) ? "#fbbf24" : "#334155",
                                fontSize: "14px",
                                transition: "color 0.2s",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span style={styles.ratingNum}>{Number(r.rating).toFixed(1)}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>No rating</span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={styles.cardDesc}>
                    {r.description
                      ? r.description.length > 90
                        ? r.description.slice(0, 90) + "..."
                        : r.description
                      : "No description available"}
                  </p>

                  {/* Meta chips */}
                  <div style={styles.cardMeta}>
                    {r.total_time && (
                      <span style={styles.metaChip}>🕐 {r.total_time} min</span>
                    )}
                    {r.serves && <span style={styles.metaChip}>👥 {r.serves}</span>}
                    {r.prep_time && (
                      <span style={styles.metaChip}>🔪 Prep: {r.prep_time}m</span>
                    )}
                  </div>
                  {/* Glint effect div */}
                  <div className="card-glint" style={styles.cardGlint} />
                  {/* Hover glow bar */}
                  <div style={styles.cardGlow} />
                </div>
              </div>
            );
          })}
        </div>
      )
      }

      {/* Pagination */}
      {
        !loading && totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              className="btn btn-ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>

            <div style={styles.pageNumbers}>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      ...styles.pageBtn,
                      ...(page === pageNum ? styles.pageBtnActive : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (page !== pageNum) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page !== pageNum) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className="btn btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )
      }
    </div >
  );
}

const styles = {
  container: {
    animation: "fadeIn 0.4s ease",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#f1f5f9",
  },
  sectionSub: {
    margin: "4px 0 0 0",
    fontSize: "0.85rem",
    color: "#64748b",
  },

  // Sort
  sortWrap: {
    position: "relative",
  },
  sortBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#94a3b8",
    fontSize: "0.82rem",
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sortDropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "rgba(15,17,23,0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "6px",
    zIndex: 50,
    minWidth: "200px",
    animation: "slideDown 0.2s ease",
    boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
  },
  sortOption: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px 14px",
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "0.84rem",
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
  },
  sortOptionActive: {
    background: "rgba(249,115,22,0.1)",
    color: "#f97316",
    fontWeight: 600,
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
    gap: "20px",
  },
  card: {
    position: "relative",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "0",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "slideUp 0.5s ease both",
    display: "flex",
    flexDirection: "column",
    gap: "0",
    overflow: "hidden",
    transformStyle: "preserve-3d",
    willChange: "transform",
  },
  cardImage: {
    position: "relative",
    width: "100%",
    height: "200px",
    overflow: "hidden",
    flexShrink: 0,
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  imgOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(15,17,23,0.9) 0%, rgba(15,17,23,0.3) 50%, transparent 100%)",
    pointerEvents: "none",
  },
  cardBody: {
    padding: "16px 20px 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  cardGlow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "linear-gradient(90deg, transparent, #f97316, #fbbf24, transparent)",
    opacity: 0,
    transition: "opacity 0.3s",
  },
  cardGlint: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 0.3s ease",
    zIndex: 5,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cuisineBadge: {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#f97316",
    background: "rgba(249,115,22,0.12)",
    padding: "4px 12px",
    borderRadius: "100px",
    letterSpacing: "0.02em",
  },
  heartBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    transition: "all 0.2s",
    padding: "4px",
    borderRadius: "50%",
    lineHeight: 1,
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#f1f5f9",
    lineHeight: 1.3,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  stars: {
    display: "flex",
    gap: "2px",
  },
  ratingNum: {
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#fbbf24",
  },
  cardDesc: {
    margin: 0,
    fontSize: "0.82rem",
    color: "#94a3b8",
    lineHeight: 1.5,
    flex: 1,
  },
  cardMeta: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  metaChip: {
    fontSize: "0.73rem",
    color: "#94a3b8",
    background: "rgba(255,255,255,0.06)",
    padding: "4px 10px",
    borderRadius: "100px",
    fontWeight: 500,
  },

  // Skeleton
  skeletonCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "22px",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  skeletonLine: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "6px",
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    animation: "fadeIn 0.5s ease",
  },
  emptyIcon: {
    fontSize: "56px",
    display: "block",
    marginBottom: "16px",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#f1f5f9",
  },
  emptyText: {
    margin: "8px 0 0 0",
    fontSize: "0.9rem",
    color: "#64748b",
  },

  // Pagination
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "36px",
    paddingBottom: "24px",
    animation: "fadeIn 0.5s ease 0.3s both",
  },
  pageNumbers: {
    display: "flex",
    gap: "4px",
  },
  pageBtn: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "0.85rem",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  pageBtnActive: {
    background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,191,36,0.15))",
    borderColor: "rgba(249,115,22,0.4)",
    color: "#f97316",
    boxShadow: "0 0 16px rgba(249,115,22,0.1)",
    transform: "scale(1.05)",
  },
};
