import sys
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.domain import User, BusinessProfile
from app.core.security import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_data(db: Session):
    print("Seeding database...")
    
    # Check if we already seeded our test users
    if db.query(User).filter(User.email == "apex@example.com").first():
        print("Database already contains the test data. Skipping seed.")
        return

    # Create dummy users
    users_data = [
        {"email": "apex@example.com", "password": "password123", "role": "business"},
        {"email": "global@example.com", "password": "password123", "role": "business"},
        {"email": "nextgen@example.com", "password": "password123", "role": "business"},
        {"email": "oceanic@example.com", "password": "password123", "role": "business"},
        {"email": "nexus@example.com", "password": "password123", "role": "business"},
    ]

    created_users = []
    for u in users_data:
        user = User(
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            role=u["role"],
            is_verified=True
        )
        db.add(user)
        created_users.append(user)
    
    db.commit()
    for user in created_users:
        db.refresh(user)

    # Create dummy business profiles
    profiles_data = [
        {
            "user_id": created_users[0].id,
            "company_name": "Apex Manufacturing",
            "industry": "FMCG",
            "sub_industry": "Packaged Foods",
            "business_type": "Manufacturer",
            "country": "India",
            "state": "Maharashtra",
            "city": "Mumbai",
            "areas_served": ["India", "UAE"],
            "revenue_band": "$5M - $10M",
            "team_size": "51-200",
            "years_in_business": 10,
            "business_intent": ["Seeking Distributors", "Looking for Export Opportunities"],
            "products_services": ["Packaged Snacks", "Beverages"],
            "moq": "1000 units",
            "profile_completeness": 95
        },
        {
            "user_id": created_users[1].id,
            "company_name": "Global Exports Pvt Ltd",
            "industry": "Logistics",
            "sub_industry": "Freight Forwarding",
            "business_type": "Service Provider",
            "country": "India",
            "state": "Delhi",
            "city": "New Delhi",
            "areas_served": ["Global"],
            "revenue_band": "$1M - $5M",
            "team_size": "11-50",
            "years_in_business": 5,
            "business_intent": ["Looking for Buyers", "Open to Partnerships"],
            "products_services": ["Ocean Freight", "Customs Clearance"],
            "moq": "None",
            "profile_completeness": 85
        },
        {
            "user_id": created_users[2].id,
            "company_name": "NextGen Solutions",
            "industry": "Technology",
            "sub_industry": "Software",
            "business_type": "Service Provider",
            "country": "India",
            "state": "Karnataka",
            "city": "Bangalore",
            "areas_served": ["Global"],
            "revenue_band": "$10M+",
            "team_size": "201+",
            "years_in_business": 12,
            "business_intent": ["Looking for Investment", "Open to Partnerships"],
            "products_services": ["SaaS", "Enterprise Solutions"],
            "moq": "1 License",
            "profile_completeness": 90
        },
        {
            "user_id": created_users[3].id,
            "company_name": "Oceanic Trade",
            "industry": "FMCG",
            "sub_industry": "Packaged Foods",
            "business_type": "Distributor",
            "country": "UAE",
            "state": "Dubai",
            "city": "Dubai",
            "areas_served": ["Middle East"],
            "revenue_band": "$5M - $10M",
            "team_size": "11-50",
            "years_in_business": 8,
            "business_intent": ["Seeking Suppliers", "Looking for Export Opportunities"],
            "products_services": ["FMCG Distribution"],
            "moq": "Pallet Load",
            "profile_completeness": 100
        },
        {
            "user_id": created_users[4].id,
            "company_name": "Nexus Retail",
            "industry": "Retail",
            "sub_industry": "Electronics",
            "business_type": "Distributor",
            "country": "India",
            "state": "Maharashtra",
            "city": "Mumbai",
            "areas_served": ["Maharashtra"],
            "revenue_band": "$1M - $5M",
            "team_size": "1-10",
            "years_in_business": 2,
            "business_intent": ["Seeking Suppliers"],
            "products_services": ["Consumer Electronics"],
            "moq": "500 units",
            "profile_completeness": 70
        }
    ]

    for p in profiles_data:
        profile = BusinessProfile(**p)
        db.add(profile)
    
    db.commit()
    print("Seed complete! Added 5 test users and businesses.")

if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
