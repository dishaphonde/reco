from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.domain import User, BusinessProfile
from app.schemas.domain import BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileOut

router = APIRouter()


def compute_completeness(profile: BusinessProfile) -> int:
    """Auto-calculate profile completeness as a percentage."""
    fields = [
        profile.company_name,
        profile.industry,
        profile.sub_industry,
        profile.business_type,
        profile.country,
        profile.state,
        profile.city,
        profile.revenue_band,
        profile.team_size,
        profile.years_in_business,
        profile.moq,
    ]
    list_fields = [
        profile.areas_served,
        profile.business_intent,
        profile.products_services,
    ]

    filled = sum(1 for f in fields if f is not None and str(f).strip() != "" and str(f) != "0")
    filled += sum(1 for f in list_fields if f and len(f) > 0)

    total = len(fields) + len(list_fields)
    return round((filled / total) * 100)


@router.get("/me", response_model=BusinessProfileOut)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please create one.")
    return profile


@router.post("", response_model=BusinessProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_in: BusinessProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")

    profile = BusinessProfile(
        user_id=current_user.id,
        **profile_in.model_dump(),
    )
    profile.profile_completeness = compute_completeness(profile)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("", response_model=BusinessProfileOut)
def update_profile(
    profile_in: BusinessProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Use POST to create one.")

    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    profile.profile_completeness = compute_completeness(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/upsert", response_model=BusinessProfileOut)
def upsert_profile(
    profile_in: BusinessProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update profile in one call — convenient for onboarding."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        profile = BusinessProfile(user_id=current_user.id)
        db.add(profile)

    for key, value in profile_in.model_dump().items():
        setattr(profile, key, value)

    profile.profile_completeness = compute_completeness(profile)
    db.commit()
    db.refresh(profile)
    return profile
