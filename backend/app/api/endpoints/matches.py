from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.domain import User, Match, BusinessProfile, DealRoom

router = APIRouter()


def _serialize_profile(p: BusinessProfile):
    if not p:
        return None
    return {
        "user_id": p.user_id,
        "company_name": p.company_name,
        "industry": p.industry,
        "business_type": p.business_type,
        "city": p.city,
        "country": p.country,
        "revenue_band": p.revenue_band,
        "profile_completeness": p.profile_completeness or 0,
        "logo_url": p.logo_url,
    }


@router.get("")
def get_my_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    matches = db.query(Match).filter(
        (Match.user1_id == current_user.id) | (Match.user2_id == current_user.id)
    ).all()

    result = []
    for m in matches:
        partner_id = m.user2_id if m.user1_id == current_user.id else m.user1_id
        partner_profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == partner_id).first()
        deal_room = db.query(DealRoom).filter(DealRoom.match_id == m.id).first()

        result.append({
            "id": m.id,
            "match_score": m.match_score,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "partner_profile": _serialize_profile(partner_profile),
            "deal_room_id": deal_room.id if deal_room else None,
        })

    return {"items": result, "total": len(result)}
