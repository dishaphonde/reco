import csv
import sys
import os
import random
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.database import SessionLocal, Base, engine
from app.models.domain import User, BusinessProfile
from app.core.security import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)

CSV_PATH_DEFAULT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "bridge_business_dataset.csv")

def import_csv(path: str, limit: int = None):
    db: Session = SessionLocal()
    created = 0
    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if limit and i >= limit:
                    break

                email = f"seed_user_{row.get('id', i+1)}@example.com"
                try:
                    hp = get_password_hash("password123")
                except Exception:
                    hp = "password123"

                user = User(email=email, hashed_password=hp, role="business", is_verified=(row.get('verified','No').strip().lower()=='yes'))
                db.add(user)
                db.flush()

                profile = BusinessProfile(
                    user_id=user.id,
                    company_name=row.get('company_name') or f"Company {user.id}",
                    industry=row.get('industry') or "",
                    sub_industry=row.get('sub_industry') or "",
                    business_type=random.choice(["Manufacturer","Distributor","Service Provider","Retail"]),
                    country=row.get('country') or "",
                    state=row.get('state') or "",
                    city=row.get('city') or "",
                    areas_served=[row.get('country')] if row.get('country') else [],
                    revenue_band=row.get('revenue_band') or "",
                    team_size=row.get('team_size') or "",
                    years_in_business=int(row.get('years_in_business') or random.randint(1,20)),
                    registration_number=row.get('registration_number') or None,
                    business_intent=[row.get('business_intent')] if row.get('business_intent') else [],
                    products_services=[row.get('products_services')] if row.get('products_services') else [],
                    moq=row.get('MOQ') or row.get('moq') or None,
                    profile_completeness=int(row.get('profile_completeness') or 0),
                )
                db.add(profile)
                created += 1

            db.commit()
    finally:
        db.close()

    print(f"Imported {created} profiles from {path}")

if __name__ == '__main__':
    path = CSV_PATH_DEFAULT
    limit = None
    if len(sys.argv) > 1:
        path = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            limit = int(sys.argv[2])
        except ValueError:
            pass

    if not os.path.exists(path):
        print(f"CSV file not found: {path}")
        sys.exit(1)

    import_csv(path, limit)
