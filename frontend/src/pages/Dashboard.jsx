import { useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import RecipeList from "../components/RecipeList";
import RecipeDetails from "./RecipeDetails";
import HeroSection from "../components/HeroSection";
import RouletteWheel from "../components/RouletteWheel";
import WorldMap from "../components/WorldMap";
import ChefQuest from "../components/ChefQuest";
import Profile from "./Profile";
import CuisineGrid from "../components/CuisineGrid";
import ChatBot from "../components/ChatBot";
import ParallelDimension from "../components/ParallelDimension";
import FusionLab from "../components/FusionLab";
import bgImage from "../assets/dash_img.jpeg";

export default function Dashboard() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState(null);
  const [timeFilter, setTimeFilter] = useState(120);
  const [showHero, setShowHero] = useState(true);
  const [showRoulette, setShowRoulette] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [parallelRecipe, setParallelRecipe] = useState(null);
  const [showCollider, setShowCollider] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback((e) => {
    setScrollY(e.target.scrollTop);
  }, []);

  const handleToggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    setSelectedRecipe(null);
    setShowProfile(false);
    setShowMap(false);
    setShowCollider(false);
    if (q) setShowHero(false);
  }, []);

  const handleCuisineSelect = useCallback((cuisine) => {
    setCuisineFilter(cuisine);
    if (!cuisine) {
      setTimeFilter(120);
      setCuisineSearch("");
    }
    setSelectedRecipe(null);
    setShowHero(false);
    setShowMap(false);
    setShowProfile(false);
    setShowCollider(false);
  }, []);

  const handleMapSelect = useCallback((cuisine) => {
    setCuisineFilter(cuisine);
    setShowMap(false);
    setShowHero(false);
    setShowProfile(false);
  }, []);

  const handleExplore = useCallback(() => {
    setShowHero(false);
  }, []);

  const handleRouletteSelect = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setShowRoulette(false);
    setShowHero(false);
    setShowProfile(false);
  }, []);

  const handleOpenProfile = useCallback(() => {
    setShowProfile(true);
    setShowHero(false);
    setShowMap(false);
    setSelectedRecipe(null);
  }, []);

  const handleCuisineSearch = useCallback((q) => {
    setCuisineSearch(q);
    if (q) {
      setSelectedRecipe(null);
      setSearchQuery("");
      setCuisineFilter(null);
      setShowHero(false);
      setShowProfile(false);
      setShowMap(false);
      setShowCollider(false);
      setParallelRecipe(null);
    }
  }, []);

  return (
    <div style={styles.app}>
      {showRoulette && (
        <RouletteWheel
          onSelectRecipe={handleRouletteSelect}
          onClose={() => setShowRoulette(false)}
        />
      )}
      {/* Background image layer */}
      <div
        style={{
          ...styles.bgLayer,
          backgroundImage: `url(${bgImage})`,
          transform: `scale(1.1) translateY(${scrollY * 0.2}px)`,
        }}
      />
      {/* Dark overlay */}
      <div style={styles.overlay} />

      {/* Content */}
      <div style={styles.content}>
        <Header
          onSearch={handleSearch}
          onProfile={handleOpenProfile}
          onToggleChat={handleToggleChat}
        />

        <div style={styles.body}>
          <Sidebar
            onCuisineSelect={handleCuisineSelect}
            activeCuisine={cuisineFilter}
            onSurprise={() => setShowRoulette(true)}
            onMap={() => {
              setShowMap(true);
              setShowHero(false);
              setSearchQuery("");
              setCuisineFilter(null);
              setShowProfile(false);
              setSelectedRecipe(null);
            }}
            timeFilter={timeFilter}
            onTimeChange={(t) => {
              setTimeFilter(t);
              setShowHero(false);
              setShowProfile(false);
            }}
            cuisineSearch={cuisineSearch}
            onCuisineSearchChange={handleCuisineSearch}
            onCollider={() => {
              setShowCollider(true);
              setShowHero(false);
              setShowMap(false);
              setShowProfile(false);
              setSelectedRecipe(null);
              setSearchQuery("");
            }}
          />

          <main style={styles.main} onScroll={handleScroll}>
            <div className="scroll-reveal visible">
              {showProfile ? (
                <Profile
                  onClose={() => setShowProfile(false)}
                  onSelectRecipe={(recipe) => {
                    setSelectedRecipe(recipe);
                    setShowProfile(false);
                    setParallelRecipe(null);
                  }}
                />
              ) : showMap ? (
                <WorldMap onSelectCuisine={handleMapSelect} />
              ) : parallelRecipe ? (
                <ParallelDimension
                  recipe={parallelRecipe}
                  onReturn={() => setParallelRecipe(null)}
                />
              ) : selectedRecipe ? (
                <RecipeDetails
                  recipe={selectedRecipe}
                  onBack={() => setSelectedRecipe(null)}
                  onShift={(recipe) => setParallelRecipe(recipe)}
                />
              ) : showCollider ? (
                <FusionLab onClose={() => setShowCollider(false)} />
              ) : (searchQuery || cuisineFilter) ? (
                <RecipeList
                  searchQuery={searchQuery}
                  cuisineFilter={cuisineFilter}
                  timeFilter={timeFilter}
                  onSelectRecipe={setSelectedRecipe}
                />
              ) : (
                <>
                  {!cuisineSearch && <HeroSection onExplore={handleExplore} />}
                  <CuisineGrid
                    onSelectCuisine={handleCuisineSelect}
                    searchTerm={cuisineSearch}
                  />
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      <ChefQuest onOpenProfile={handleOpenProfile} />
      <ChatBot
        onSelectRecipe={setSelectedRecipe}
        isOpen={isChatOpen}
        onClose={handleToggleChat}
      />
    </div>
  );
}

const styles = {
  app: {
    position: "relative",
    minHeight: "100vh",
  },
  bgLayer: {
    position: "fixed",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
    filter: "blur(4px) brightness(0.3)",
    transform: "scale(1.05)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(15,17,23,0.92) 0%, rgba(15,17,23,0.85) 50%, rgba(15,17,23,0.95) 100%)",
    zIndex: 1,
  },
  content: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  body: {
    display: "flex",
    flex: 1,
  },
  main: {
    flex: 1,
    padding: "28px 32px",
    overflowY: "auto",
  },
};
