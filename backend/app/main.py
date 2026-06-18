from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal

# Create tables
Base.metadata.create_all(bind=engine)

from app.api.endpoints import auth, recommendations, profile, interactions, matches

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(interactions.router, prefix="/api/v1/interactions", tags=["interactions"])
app.include_router(matches.router, prefix="/api/v1/matches", tags=["matches"])


@app.on_event("startup")
def auto_seed():
    """Auto-seed 100 realistic profiles if database is empty."""
    db = SessionLocal()
    try:
        from app.models.domain import User
        count = db.query(User).count()
        if count == 0:
            try:
                import sys
                import os
                # Add backend dir to path for seed_many import
                backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                if backend_dir not in sys.path:
                    sys.path.insert(0, backend_dir)
                from seed_many import seed_many
                seed_many(db, 100)
                print("✅ Auto-seeded 100 business profiles.")
            except Exception as e:
                print(f"⚠️  Auto-seed failed: {e}")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Welcome to the Bridge API"}
