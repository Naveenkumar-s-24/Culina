import json
import os
from database import engine, SessionLocal, Base
from models import Recipe


def is_valid_number(value):
    """Return a valid number or None (handles NaN, None, empty, invalid)."""
    if value is None or value == "":
        return None
    try:
        num = float(value)
        if num != num:  # NaN check
            return None
        return num
    except (ValueError, TypeError):
        return None


def normalize_recipes(raw_data):
    """
    Normalize JSON into a flat list of recipe dictionaries.

    Handles:
    - List of recipes
    - Dict of recipes (numeric string keys)
    - Dict -> Dict -> recipes (one level deep)
    - Nested lists under common keys
    """

    # Case 1: Already a list
    if isinstance(raw_data, list):
        return raw_data

    # Case 2: Dictionary-based structures
    if isinstance(raw_data, dict):
        # Nested list under known keys
        for key in ["recipes", "data", "items", "results"]:
            if key in raw_data and isinstance(raw_data[key], list):
                return raw_data[key]

        values = list(raw_data.values())

        # Dict of recipe objects
        if values and all(isinstance(v, dict) for v in values):
            return values

        # Dict -> Dict -> recipe objects (one level deeper)
        for v in values:
            if isinstance(v, dict):
                inner_values = list(v.values())
                if inner_values and all(isinstance(iv, dict) for iv in inner_values):
                    return inner_values

    return []


def load_recipes():
    # DEBUG: show exactly which file is being read
    print("Current working directory:", os.getcwd())
    print("Looking for recipes.json at:", os.path.abspath("recipes.json"))

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Load JSON file
    try:
        with open("recipes.json", "r", encoding="utf-8") as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print("❌ recipes.json NOT FOUND in this directory.")
        return
    except json.JSONDecodeError as e:
        print("❌ Invalid JSON file:", e)
        return

    # Normalize recipes
    recipes_list = normalize_recipes(raw_data)
    print("Total recipes found in JSON:", len(recipes_list))

    if not recipes_list:
        print("❌ No recipes detected. The recipes.json file here does NOT contain recipe data.")
        return

    db = SessionLocal()

    try:
        # Clear existing data
        db.query(Recipe).delete()

        for recipe_data in recipes_list:
            recipe = Recipe(
                cuisine=recipe_data.get("cuisine"),
                title=recipe_data.get("title"),
                rating=is_valid_number(recipe_data.get("rating")),
                prep_time=(
                    int(is_valid_number(recipe_data.get("prep_time")))
                    if is_valid_number(recipe_data.get("prep_time")) is not None
                    else None
                ),
                cook_time=(
                    int(is_valid_number(recipe_data.get("cook_time")))
                    if is_valid_number(recipe_data.get("cook_time")) is not None
                    else None
                ),
                total_time=(
                    int(is_valid_number(recipe_data.get("total_time")))
                    if is_valid_number(recipe_data.get("total_time")) is not None
                    else None
                ),
                description=recipe_data.get("description"),
                nutrients=recipe_data.get("nutrients"),
                serves=recipe_data.get("serves"),
            )
            db.add(recipe)

        db.commit()
        print(f"✓ Successfully loaded {len(recipes_list)} recipes into the database!")

    except Exception as e:
        db.rollback()
        print("❌ Error loading data:", e)

    finally:
        db.close()


if __name__ == "__main__":
    load_recipes()
