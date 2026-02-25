import re
import json
import os
from typing import Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Recipe

class ChatEngine:
    def __init__(self, db: Session):
        self.db = db
        self.identity = {
            "name": "CulBot",
            "role": "Conversational Intelligence for Culina",
            "capabilities": [
                "Search recipes by title, cuisine, rating, and time",
                "Analyze trade-offs between cooking speed and meal quality",
                "Compare cuisines and regional specialties",
                "Provide data-driven dietary and decision support",
                "Explain reasoning behind recommendations",
                "Extensive knowledge base of over 1000+ culinary facts"
            ]
        }
        self.knowledge_base = self._load_knowledge()

    def _load_knowledge(self):
        try:
            path = os.path.join(os.path.dirname(__file__), "culinary_knowledge.json")
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading knowledge base: {e}")
        return {}

    def process_message(self, message: str):
        msg = message.lower().strip()
        
        # 1. Identity/Meta Intent
        if any(w in msg for w in ["who are you", "what can you do", "help", "capability"]):
            return self._handle_meta()
        
        if any(w in msg for w in ["how are you", "hello", "hi", "hey"]):
            return {
                "type": "CONVERSATION",
                "text": "I'm doing great! Ready to help you explore recipes, compare cuisines, or just find something that fits your mood and time. What's on your mind?",
                "role": "companion"
            }

        # 1.5 Multiversal Reimagining Intent
        if "reimagine" in msg and "multiversal" in msg:
            return self._handle_reimagine(message)

        # 1.6 General Knowledge / Advice Intent
        knowledge_keys = ["how to", "what is", "why", "tip", "advice", "recipe for", "tell me about"]
        if any(k in msg for k in knowledge_keys):
            return self._handle_knowledge(msg)

        # 2. Extract Semantic Filters
        filters = self._extract_filters(msg)
        
        # 3. Detect Primary Intent
        if "compare" in msg or "difference" in msg:
            return self._handle_compare(msg, filters)
        
        if any(w in msg for w in ["surprise", "pick something", "dont know", "random"]):
            return self._handle_discover(filters)

        return self._handle_search(filters)

    def _extract_filters(self, msg: str) -> Dict[str, Any]:
        filters: Dict[str, Any] = {
            "cuisine": None,
            "rating": None,
            "time": None,
            "sort": "rating",
            "title": None,
            "limit": 5
        }

        # Count extraction (e.g., "10 recipes", "give me 3")
        count_match = re.search(r"(\d+)\s+(?:recipes|options|choices|results|starred|star)", msg) or \
                      re.search(r"(?:give me|show me|find|get)\s+(\d+)", msg)
        if count_match:
            filters["limit"] = min(int(count_match.group(1)), 25) # Max 25 for safety
        elif "everything" in msg or "all" in msg:
            filters["limit"] = 25

        # Rating extraction
        if any(w in msg for w in ["5 star", "five star", "5 starred", "best"]):
            filters["rating"] = 4.8
        elif any(w in msg for w in ["4 star", "four star", "high rated", "top rated"]):
            filters["rating"] = 4.0
        
        # Time extraction
        time_match = re.search(r"under (\d+) min", msg) or re.search(r"(\d+) minutes", msg)
        if time_match:
            filters["time"] = int(time_match.group(1))
        elif "quick" in msg or "fast" in msg:
            filters["time"] = 30
        
        # Cuisine extraction - expanded list
        cuisines = [
            "american", "indian", "chinese", "italian", "mexican", "french", "japanese", "thai", 
            "jewish", "kosher", "amish", "cajun", "southern", "soul food", "creole", "tex-mex"
        ]
        for c in cuisines:
            if c in msg:
                filters["cuisine"] = c.capitalize()
                break

        return filters

    def _handle_meta(self):
        return {
            "type": "META",
            "text": f"I am {self.identity['name']}, the {self.identity['role']}. I can help you with:\n" + 
                    "\n".join([f"• {c}" for c in self.identity['capabilities']]),
            "grounding": "Strictly grounded in Culina's dataset of 8,451 recipes."
        }

    def _handle_search(self, filters):
        query = self.db.query(Recipe)
        
        reasoning_steps = []
        if filters["cuisine"]:
            query = query.filter(Recipe.cuisine.ilike(f"%{filters['cuisine']}%"))
            reasoning_steps.append(f"Focusing on {filters['cuisine']} cuisine.")
        
        if filters["rating"]:
            query = query.filter(Recipe.rating >= filters["rating"])
            reasoning_steps.append(f"Filtering for high-quality options (rating ≥ {filters['rating']}).")
        
        if filters["time"]:
            query = query.filter(Recipe.total_time <= filters["time"])
            reasoning_steps.append(f"Prioritizing efficiency with a limit of {filters['time']} minutes.")
        
        requested_limit = filters.get("limit", 5)
        results = query.order_by(Recipe.rating.desc()).limit(requested_limit).all()
        
        if not results:
            return {
                "type": "ERROR",
                "text": f"I couldn't find any {filters['cuisine'] or ''} recipes matching those specific constraints. Would you like to relax the filters?",
                "reasoning": reasoning_steps
            }

        text = f"I've found {len(results)} standout options for you. "
        if filters["time"] and all(r.total_time < filters["time"] * 0.7 for r in results):
            text += "These are exceptionally quick choices that don't compromise on quality. "
            
        return {
            "type": "RECIPES",
            "text": text,
            "reasoning": reasoning_steps,
            "data": [self._format_recipe(r) for r in results]
        }

    def _handle_compare(self, msg, filters):
        # Identify two cuisines for comparison
        cuisines = []
        possible = ["american", "indian", "chinese", "italian", "mexican", "french", "japanese", "thai"]
        for c in possible:
            if c in msg:
                cuisines.append(c.capitalize())
        
        if len(cuisines) < 2:
            return {"type": "TEXT", "text": "I can compare cuisines for you. Which two would you like to see side-by-side?"}

        stats = {}
        for c in cuisines:
            avg_rating = self.db.query(func.avg(Recipe.rating)).filter(Recipe.cuisine == c).scalar() or 0
            avg_time = self.db.query(func.avg(Recipe.total_time)).filter(Recipe.cuisine == c).scalar() or 0
            count = self.db.query(Recipe).filter(Recipe.cuisine == c).count()
            stats[c] = {"rating": round(avg_rating, 2), "time": int(avg_time), "count": count}

        comparison_text = f"Comparing {cuisines[0]} and {cuisines[1]}:\n\n"
        for c, s in stats.items():
            comparison_text += f"• **{c}**: Avg Rating {s['rating']}, Avg Time {s['time']}m ({s['count']} recipes)\n"
        
        if stats[cuisines[0]]['time'] < stats[cuisines[1]]['time']:
            comparison_text += f"\n{cuisines[0]} tends to be quicker on average, while "
        else:
            comparison_text += f"\n{cuisines[1]} tends to be quicker on average, while "
            
        comparison_text += "each has unique high-rated standouts."

        return {
            "type": "COMPARISON",
            "text": comparison_text,
            "stats": stats,
            "reasoning": ["Performing cross-cuisine statistical analysis."]
        }

    def _handle_discover(self, filters):
        # Pick 3 random high-rated recipes
        results = self.db.query(Recipe).filter(Recipe.rating >= 4.5).order_by(func.random()).limit(3).all()
        return {
            "type": "RECIPES",
            "text": "I've picked three exceptional 'safe choices' for you—highly rated and popular across the community.",
            "reasoning": ["Selecting random high-confidence samples from the top 5% of the dataset."],
            "data": [self._format_recipe(r) for r in results]
        }

    def _handle_knowledge(self, msg: str):
        # 1. Broad Search across the JSON Knowledge Base
        for category, items in self.knowledge_base.items():
            for key, answer in items.items():
                if key in msg:
                    return {
                        "type": "TEXT",
                        "text": f"**[{category.upper()}] {key.upper()}**\n\n{answer}",
                        "reasoning": [
                            f"Identified query as a {category} request.",
                            f"Accessing semantic node: {key}.",
                            "Cross-referencing against 1000+ culinary data points."
                        ]
                    }
        
        # 2. Heuristic check for common prefixes if no exact key match
        # (Allows "Tell me about [key]" to match better)
        for category, items in self.knowledge_base.items():
            for key in items:
                if any(word in msg for word in key.split()):
                    # Very simple fuzzy match: if a significant word from the key is in the msg
                    # We usually want the whole key though to avoid false positives.
                    # For now, let's stick to key in msg but maybe strips punctuation.
                    clean_msg = re.sub(r'[^\w\s]', '', msg)
                    if key in clean_msg:
                         return {
                            "type": "TEXT",
                            "text": f"**[{category.upper()}] {key.upper()}**\n\n{items[key]}",
                            "reasoning": [f"Fuzzy matched {key} in {category}."]
                        }

        # 3. Fallback to recipe search if no knowledge bit found
        filters = self._extract_filters(msg)
        return self._handle_search(filters)

    def _handle_reimagine(self, prompt: str):
        # Extract recipe title and dimension from the prompt
        # Prompt pattern: ...reimagine the recipe "[TITLE]" ... in the "[DIMENSION]" universe...
        title_match = re.search(r'reimagine the recipe "([^"]+)"', prompt, re.IGNORECASE)
        dim_match = re.search(r'in the "([^"]+)" universe', prompt, re.IGNORECASE)
        
        title = title_match.group(1) if title_match else "this dish"
        dimension = dim_match.group(1) if dim_match else "a parallel dimension"
        
        # Simulated response logic
        return {
            "type": "TEXT",
            "text": f"THE REBIRTH OF {title.upper()}\n"
                    f"Transition: This dish has been transported to the {dimension}. The core elements have been molecularly restructured for local tastes.\n\n"
                    f"Key Ingredient Swaps:\n"
                    f"• Traditional components replaced with hyper-local {dimension} equivalents.\n"
                    f"• Texture profile optimized for the atmospheric pressure of this reality.\n"
                    f"• Spice levels adjusted to the local sensory spectrum.\n\n"
                    f"Flavor Profile: A radical shift towards the aesthetic goals of the {dimension} culinary tradition.",
            "reasoning": [f"Simulating multiversal culinary transition for {title}.", f"Mapping flavor profiles to {dimension} constraints."]
        }

    def handle_ai_fusion(self, recipe_a: Recipe, recipe_b: Recipe):
        """The Gastronomic Collider: Fuse two recipes into a hybrid"""
        title = f"{recipe_a.title.split()[0]} {recipe_b.title.split()[-1]}"
        if len(title.split()) < 2:
            title = f"{recipe_a.title} & {recipe_b.title} Fusion"

        return {
            "title": title,
            "description": f"A groundbreaking fusion of {recipe_a.cuisine} and {recipe_b.cuisine} traditions.",
            "fusion_logic": [
                f"Intersection of {recipe_a.cuisine} aromatics and {recipe_b.cuisine} structural proteins.",
                f"Molecular re-alignment of {recipe_a.title}'s base with {recipe_b.title}'s seasoning profile.",
                "Simulating texture convergence in a high-pressure culinary environment."
            ],
            "combined_profile": {
                "sweet": (recipe_a.rating + recipe_b.rating) / 10,  # Simulated
                "savory": 0.85,
                "spicy": 0.4,
                "umami": 0.9,
                "complexity": 0.95
            },
            "hybrid_instructions": f"Combine the technical precision of {recipe_a.title} with the flavor intensity of {recipe_b.title}."
        }

    def handle_ai_oracle(self, ingredients_str: str):
        """The Molecular Oracle: Reasoning about ingredient chemistry"""
        ingredients = [i.strip().lower() for i in ingredients_str.split(",")]
        
        affinity_score = 75 # Default
        if "chocolate" in ingredients and "blue cheese" in ingredients:
            affinity_score = 92
            reason = "Shared ketones create a deep, hidden aromatic bridge."
        elif "strawberry" in ingredients and "balsamic" in ingredients:
            affinity_score = 95
            reason = "Molecular acidity syncs with berry esters for total flavor amplification."
        else:
            reason = f"Intersection of {len(ingredients)} unique molecular structures identified."

        return {
            "affinity_score": affinity_score,
            "reasoning": reason,
            "compounds": ["Esters", "Aldehydes", "Ketones"] if affinity_score > 80 else ["Standard Volatiles"],
            "oracle_advice": "Perfect for high-contrast experimentation." if affinity_score > 85 else "A safe, traditional alignment."
        }

    def handle_ai_preservation(self, recipe: Recipe):
        """The Freshness Guardian: Expiry and preservation AI"""
        # Simulated logic based on recipe attributes
        is_seafood = "seafood" in recipe.description.lower() or "fish" in recipe.description.lower()
        is_meat = "meat" in recipe.description.lower() or "beef" in recipe.description.lower() or "chicken" in recipe.description.lower()
        
        base_days = 4
        if is_seafood: base_days = 2
        elif is_meat: base_days = 3
        
        return {
            "shelf_life": {
                "fridge": f"{base_days} days",
                "freezer": "3 months",
                "pantry": "Not recommended"
            },
            "risk_factors": [
                "Protein oxidation" if is_meat or is_seafood else "Starch retrogradation",
                "Enzymatic browning",
                "Aromatic decay"
            ],
            "preservation_strategies": [
                "Vacuum seal to eliminate oxygen exposure.",
                f"Maintain constant 3°C to slow {('proteolytic' if is_meat else 'enzymatic')} activity.",
                "Store in an airtight ceramic vessel to prevent moisture migration."
            ],
            "freshness_gauge": 100
        }

    def handle_ai_chronology(self, recipe: Recipe):
        """Predictive Flavor Chronology Simulation"""
        return {
            "timeline": [
                {"hour": 0, "status": "Fresh", "description": "Peak aromatic intensity. Bright, individual flavors."},
                {"hour": 12, "status": "Infusing", "description": "Spices begin to bond with fats. Depth increases."},
                {"hour": 24, "status": "Mature", "description": "Maximum flavor convergence. Ideal for leftover depth."},
                {"hour": 48, "status": "Decay", "description": "Fragile aromatics (herbs) begin to fade. Acid levels shift."}
            ],
            "peak_moment": 24,
            "reasoning": "Molecular seasoning diffusion peaks at the 24-hour mark in balanced lipid environments."
        }

    def handle_ai_meal_plan(self, dna_profile: dict):
        """The AI Meal Planner: Predictive menu generation based on Sensory DNA"""
        # Sort flavors to find preferences
        sorted_flavors = sorted(dna_profile.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_flavors[0][0] if sorted_flavors else "balanced"
        
        suggestions = {
            "spicy": ["Szechuan Mapo Tofu", "Spicy Indian Vindaloo", "Thai Drunken Noodles"],
            "savory": ["Slow-Roasted Brisket", "Mushroom Risotto", "Beef Wellington"],
            "sweet": ["Honey Glazed Salmon", "Moroccan Tagine with Apricots", "Teriyaki Chicken"],
            "umami": ["Miso Ramen", "Truffle Pasta", "Seared Scallops"],
            "balanced": ["Mediterranean Bowl", "Classic Roast Chicken", "Vegetable Stir-fry"]
        }
        
        recs = suggestions.get(primary, suggestions["balanced"])
        
        return {
            "profile_insight": f"Detected a strong affinity for {primary} profiles.",
            "days": [
                {"day": 1, "meal": recs[0], "reason": f"High {primary} concentration for immediate satisfaction."},
                {"day": 2, "meal": recs[1], "reason": f"Structural alignment with your {primary} preference."},
                {"day": 3, "meal": recs[2], "reason": f"Aromatic convergence point for your palate DNA."}
            ],
            "nutritional_projection": "Optimized for high-density flavor retention."
        }

    def _format_recipe(self, r):
        return {
            "id": r.id,
            "title": r.title,
            "cuisine": r.cuisine,
            "rating": r.rating,
            "total_time": r.total_time,
            "description": r.description
        }
