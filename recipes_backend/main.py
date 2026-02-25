from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Recipe
from pydantic import BaseModel
from chat_engine import ChatEngine

app = FastAPI(title="Recipes API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class FusionRequest(BaseModel):
    recipe_id_a: int
    recipe_id_b: int

class MealPlanRequest(BaseModel):
    dna_profile: dict

@app.post("/api/chat")
def chat_with_culbot(request: ChatRequest, db: Session = Depends(get_db)):
    """Conversational intelligence endpoint"""
    engine = ChatEngine(db)
    response = engine.process_message(request.message)
    return response

@app.get("/api/recipes")
def get_recipes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db)
):
    """Get paginated recipes sorted by rating (descending)"""
    total = db.query(Recipe).count()
    offset = (page - 1) * limit
    
    recipes = db.query(Recipe).order_by(Recipe.rating.desc()).offset(offset).limit(limit).all()
    
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "data": [
            {
                "id": r.id,
                "cuisine": r.cuisine,
                "title": r.title,
                "rating": r.rating,
                "prep_time": r.prep_time,
                "cook_time": r.cook_time,
                "total_time": r.total_time,
                "description": r.description,
                "nutrients": r.nutrients,
                "serves": r.serves
            }
            for r in recipes
        ]
    }

@app.get("/api/recipes/search")
def search_recipes(
    title: Optional[str] = None,
    cuisine: Optional[str] = None,
    rating: Optional[float] = None,
    total_time: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Search recipes with filters"""
    query = db.query(Recipe)
    
    if title:
        search_pattern = f"%{title.strip()}%"
        query = query.filter(
            or_(
                Recipe.title.ilike(search_pattern),
                Recipe.cuisine.ilike(search_pattern)
            )
        )
    if cuisine:
        query = query.filter(Recipe.cuisine.ilike(f"%{cuisine}%"))
    if rating is not None:
        query = query.filter(Recipe.rating >= rating)
    if total_time is not None:
        query = query.filter(Recipe.total_time <= total_time)
    
    recipes = query.all()
    
    return [
        {
            "id": r.id,
            "cuisine": r.cuisine,
            "title": r.title,
            "rating": r.rating,
            "prep_time": r.prep_time,
            "cook_time": r.cook_time,
            "total_time": r.total_time,
            "description": r.description,
            "nutrients": r.nutrients,
            "serves": r.serves
        }
        for r in recipes
    ]

@app.post("/api/ai/fuse")
def fuse_recipes(request: FusionRequest, db: Session = Depends(get_db)):
    """The Gastronomic Collider: Fuse two recipes into a hybrid"""
    engine = ChatEngine(db)
    recipe_a = db.query(Recipe).filter(Recipe.id == request.recipe_id_a).first()
    recipe_b = db.query(Recipe).filter(Recipe.id == request.recipe_id_b).first()
    
    if not recipe_a or not recipe_b:
        return {"error": "One or both recipes not found"}
        
    return engine.handle_ai_fusion(recipe_a, recipe_b)

@app.get("/api/ai/oracle")
def get_molecular_oracle(ingredients: str, db: Session = Depends(get_db)):
    """The Molecular Oracle: Get chemical affinity reasoning for ingredients"""
    engine = ChatEngine(db)
    return engine.handle_ai_oracle(ingredients)

@app.get("/api/ai/freshness/{recipe_id}")
def get_freshness_report(recipe_id: int, db: Session = Depends(get_db)):
    """The Freshness Guardian: Get expiry and preservation strategy"""
    engine = ChatEngine(db)
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        return {"error": "Recipe not found"}
    return engine.handle_ai_preservation(recipe)

@app.get("/api/ai/chronology/{recipe_id}")
def get_flavor_chronology(recipe_id: int, db: Session = Depends(get_db)):
    """Predictive Flavor Chronology: Simulate flavor evolution over 48h"""
    engine = ChatEngine(db)
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        return {"error": "Recipe not found"}
    return engine.handle_ai_chronology(recipe)

# How to run:
# 1. Install dependencies: pip install -r requirements.txt
# 2. Load data: python load_data.py
# 3. Start server: uvicorn main:app --reload
# 4. Open browser: http://127.0.0.1:8000/docs
