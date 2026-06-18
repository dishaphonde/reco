from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.domain import BusinessProfile, User, Interaction

router = APIRouter()


def _generate_match_reasons(p1: BusinessProfile, p2: BusinessProfile) -> List[str]:
    reasons = []
    if p1.industry and p1.industry == p2.industry:
        reasons.append(f"Same industry: {p1.industry}")
    if p1.sub_industry and p1.sub_industry == p2.sub_industry:
        reasons.append(f"Same sub-industry: {p1.sub_industry}")
    intent1 = set(p1.business_intent or [])
    intent2 = set(p2.business_intent or [])
    common_intents = intent1.intersection(intent2)
    if common_intents:
        reasons.append(f"Shared intent: {', '.join(list(common_intents)[:2])}")
    if p1.country and p1.country == p2.country:
        reasons.append(f"Same country: {p1.country}")
        if p1.state and p1.state == p2.state:
            reasons.append(f"Same state: {p1.state}")
    if p1.revenue_band and p1.revenue_band == p2.revenue_band:
        reasons.append(f"Compatible revenue band: {p1.revenue_band}")
    if p1.moq and p1.moq == p2.moq:
        reasons.append("Compatible MOQ")
    if (p2.profile_completeness or 0) > 80:
        reasons.append("Highly complete profile")
    if p1.export_ready and p2.export_ready:
        reasons.append("Both export ready")
    return reasons if reasons else ["Potential business synergy"]


def calculate_match_score(profile1: BusinessProfile, profile2: BusinessProfile) -> float:
    score = 0.0

    # 1. Sector Match = 25%
    if profile1.industry and profile1.industry == profile2.industry:
        score += 25.0
        if profile1.sub_industry and profile2.sub_industry and profile1.sub_industry == profile2.sub_industry:
            score += 5.0

    # 2. Intent Match = 20%
    intent1 = set(profile1.business_intent or [])
    intent2 = set(profile2.business_intent or [])
    if intent1.intersection(intent2):
        score += 20.0

    # 3. Geography Match = 15%
    if profile1.country and profile1.country == profile2.country:
        score += 10.0
        if profile1.state and profile1.state == profile2.state:
            score += 5.0

    # 4. Revenue Match = 15%
    if profile1.revenue_band and profile1.revenue_band == profile2.revenue_band:
        score += 15.0

    # 5. MOQ Compatibility = 10%
    if profile1.moq and profile1.moq == profile2.moq:
        score += 10.0

    # 6. Profile Completeness = 10%
    if (profile2.profile_completeness or 0) > 80:
        score += 10.0

    # 7. Export Readiness = 5%
    if profile1.export_ready and profile2.export_ready:
        score += 5.0

    return min(score, 100.0)


@router.get("/feed")
def get_recommendation_feed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    min_score: float = Query(35.0, ge=0.0, le=100.0),
):
    current_profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == current_user.id
    ).first()

    if not current_profile:
        raise HTTPException(
            status_code=404,
            detail="Please complete your profile before viewing recommendations."
        )

    # IDs of users already interacted with
    already_interacted = db.query(Interaction.to_user_id).filter(
        Interaction.from_user_id == current_user.id
    ).all()
    excluded_ids = {row[0] for row in already_interacted}
    excluded_ids.add(current_user.id)

    all_profiles = db.query(BusinessProfile).filter(
        ~BusinessProfile.user_id.in_(excluded_ids)
    ).all()

    recommendations = []
    for profile in all_profiles:
        score = calculate_match_score(current_profile, profile)
        if score >= min_score:
            reasons = _generate_match_reasons(current_profile, profile)
            recommendations.append({
                "profile": {
                    "id": profile.id,
                    "user_id": profile.user_id,
                    "company_name": profile.company_name,
                    "logo_url": profile.logo_url,
                    "industry": profile.industry,
                    "sub_industry": profile.sub_industry,
                    "business_type": profile.business_type,
                    "country": profile.country,
                    "state": profile.state,
                    "city": profile.city,
                    "areas_served": profile.areas_served or [],
                    "revenue_band": profile.revenue_band,
                    "team_size": profile.team_size,
                    "years_in_business": profile.years_in_business,
                    "business_intent": profile.business_intent or [],
                    "products_services": profile.products_services or [],
                    "moq": profile.moq,
                    "export_ready": profile.export_ready or False,
                    "profile_completeness": profile.profile_completeness or 0,
                },
                "match_score": round(score, 1),
                "match_reasons": reasons,
            })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)

    total = len(recommendations)
    start = (page - 1) * size
    end = start + size
    paged = recommendations[start:end]
    return {"items": paged, "page": page, "size": size, "total": total}


@router.get("/profiles")
def list_profiles(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=500)
):
    """Return paginated list of all business profiles."""
    all_profiles = db.query(BusinessProfile).all()
    total = len(all_profiles)
    start = (page - 1) * size
    end = start + size
    items = all_profiles[start:end]
    return {"items": [
        {
            "id": p.id,
            "user_id": p.user_id,
            "company_name": p.company_name,
            "industry": p.industry,
            "business_type": p.business_type,
            "country": p.country,
            "profile_completeness": p.profile_completeness or 0,
        }
        for p in items
    ], "page": page, "size": size, "total": total}
