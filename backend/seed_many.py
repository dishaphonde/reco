import sys
import os
import random
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.domain import User, BusinessProfile
from app.core.security import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)

INDUSTRIES = [
    ("FMCG", "Packaged Foods"),
    ("Technology", "Software"),
    ("Retail", "Electronics"),
    ("Logistics", "Freight Forwarding"),
    ("Healthcare", "Pharmaceuticals"),
    ("Agriculture", "Produce"),
    ("Automotive", "Parts"),
    ("Textiles", "Apparel"),
]

INTENTS = [
    "Seeking Distributors",
    "Looking for Buyers",
    "Open to Partnerships",
    "Looking for Investment",
    "Seeking Suppliers",
    "Looking for Export Opportunities",
]

REVENUE_BANDS = ["$0 - $1M", "$1M - $5M", "$5M - $10M", "$10M+"]
MOQS = ["None", "100 units", "500 units", "1000 units", "Pallet Load"]
COUNTRIES = ["India", "UAE", "USA", "UK", "China", "Germany"]
STATES = ["Maharashtra", "Delhi", "Karnataka", "California", "London", "Guangdong"]

def random_profile(user_id):
    industry, sub = random.choice(INDUSTRIES)
    country = random.choice(COUNTRIES)
    state = random.choice(STATES)
    revenue = random.choice(REVENUE_BANDS)
    moq = random.choice(MOQS)
    intents = random.sample(INTENTS, k=random.randint(1,2))
    products = [f"Product {random.randint(1,20)}" for _ in range(random.randint(1,3))]
    completeness = random.randint(50,100)
    return {
        "user_id": user_id,
        "company_name": f"Company {user_id}",
        "industry": industry,
        "sub_industry": sub,
        "business_type": random.choice(["Manufacturer","Distributor","Service Provider","Retail"]),
        "country": country,
        "state": state,
        "city": f"City{random.randint(1,200)}",
        "areas_served": [country],
        "revenue_band": revenue,
        "team_size": random.choice(["1-10","11-50","51-200","201+"]),
        "years_in_business": random.randint(1,25),
        "business_intent": intents,
        "products_services": products,
        "moq": moq,
        "profile_completeness": completeness,
        "export_ready": random.choice([True, False]),
    }

def seed_many(db: Session, count: int = 100):
    existing = db.query(User).count()
    start = existing + 1
    users = []
    for i in range(start, start + count):
        try:
            hp = get_password_hash("password123")
        except Exception:
            # If password hashing fails in this environment, fall back to storing plain (dev only)
            hp = "password123"
        u = User(
            email=f"user{i}@example.com",
            hashed_password=hp,
            role="business",
            is_verified=True
        )
        db.add(u)
        users.append(u)

    db.commit()
    for u in users:
        db.refresh(u)

    for u in users:
        p = BusinessProfile(**random_profile(u.id))
        db.add(p)

    db.commit()
    print(f"Seeded {count} users and profiles.")

if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    db = SessionLocal()
    try:
        n = 100
        if len(sys.argv) > 1:
            try:
                n = int(sys.argv[1])
            except ValueError:
                pass
        seed_many(db, n)
    finally:
        db.close()
