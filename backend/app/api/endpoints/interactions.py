from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.domain import User, Interaction, Match, DealRoom, BusinessProfile
from app.schemas.domain import InteractionCreate

router = APIRouter()


def _calculate_match_score(p1: BusinessProfile, p2: BusinessProfile) -> float:
    score = 0.0
    if p1.industry and p1.industry == p2.industry:
        score += 25.0
        if p1.sub_industry and p1.sub_industry == p2.sub_industry:
            score += 5.0
    intent1 = set(p1.business_intent or [])
    intent2 = set(p2.business_intent or [])
    if intent1.intersection(intent2):
        score += 20.0
    if p1.country and p1.country == p2.country:
        score += 10.0
        if p1.state and p1.state == p2.state:
            score += 5.0
    if p1.revenue_band and p1.revenue_band == p2.revenue_band:
        score += 15.0
    if p1.moq and p1.moq == p2.moq:
        score += 10.0
    if (p2.profile_completeness or 0) > 80:
        score += 10.0
    if p1.export_ready and p2.export_ready:
        score += 5.0
    return min(score, 100.0)


@router.post("")
def record_interaction(
    interaction_in: InteractionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    action = interaction_in.action.upper()
    if action not in ("LIKE", "PASS", "SUPERLIKE"):
        raise HTTPException(status_code=400, detail="action must be LIKE, PASS, or SUPERLIKE")

    # Prevent duplicate interactions
    existing = db.query(Interaction).filter(
        Interaction.from_user_id == current_user.id,
        Interaction.to_user_id == interaction_in.target_user_id,
    ).first()
    if existing:
        existing.action = action
        db.commit()
        interaction = existing
    else:
        interaction = Interaction(
            from_user_id=current_user.id,
            to_user_id=interaction_in.target_user_id,
            action=action,
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)

    matched = False
    match_id = None

    # For demo purposes, automatically consider it a mutual match
    if action in ("LIKE", "SUPERLIKE"):
        reverse = True

        if reverse:
            # Check no match already exists
            existing_match = db.query(Match).filter(
                (
                    (Match.user1_id == current_user.id) & (Match.user2_id == interaction_in.target_user_id)
                ) | (
                    (Match.user1_id == interaction_in.target_user_id) & (Match.user2_id == current_user.id)
                )
            ).first()

            if not existing_match:
                # Compute score from profiles
                p1 = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
                p2 = db.query(BusinessProfile).filter(BusinessProfile.user_id == interaction_in.target_user_id).first()
                score = _calculate_match_score(p1, p2) if p1 and p2 else 0.0

                match = Match(
                    user1_id=current_user.id,
                    user2_id=interaction_in.target_user_id,
                    match_score=score,
                )
                db.add(match)
                db.commit()
                db.refresh(match)

                deal_room = DealRoom(match_id=match.id)
                db.add(deal_room)
                db.commit()

                matched = True
                match_id = match.id
            else:
                matched = True
                match_id = existing_match.id

    return {
        "id": interaction.id,
        "from_user_id": interaction.from_user_id,
        "to_user_id": interaction.to_user_id,
        "action": interaction.action,
        "matched": matched,
        "match_id": match_id,
    }
