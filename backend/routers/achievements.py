
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserBadge, Badge
from dependencies import get_current_user

router = APIRouter(
    prefix="/achievements",
    tags=["Achievement Badges"]
)


@router.get("/me")
def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    earned_badges = (
        db.query(UserBadge)
        .join(Badge, UserBadge.badge_id == Badge.id)
        .filter(UserBadge.user_id == current_user.id)
        .order_by(UserBadge.earned_at.desc())
        .all()
    )

    return {
        "total_earned": len(earned_badges),
        "badges": [
            {
                "id": item.badge.id,
                "name": item.badge.name,
                "description": item.badge.description,
                "icon": item.badge.icon,
                "earned_at": item.earned_at
            }
            for item in earned_badges
        ]
    }
