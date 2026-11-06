
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Streak, User
from dependencies import get_current_user

router = APIRouter(prefix="/streaks", tags=["Streak Tracking"])


@router.get("/me")
def get_my_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find the logged-in user's streak
    streak = (
        db.query(Streak)
        .filter(Streak.user_id == current_user.id)
        .first()
    )

    # If the user has never completed a workout
    if not streak:
        return {
            "user_id": current_user.id,
            "current_streak": 0,
            "longest_streak": 0,
            "last_workout_date": None,
            "next_achievement": 3,
            "days_remaining": 3,
            "message": "Complete your first workout to start your streak!"
        }

    # Reset the current streak if the user missed a day
    today = date.today()

    if (
        streak.last_workout_date is None
        or streak.last_workout_date < today - timedelta(days=1)
    ):
        streak.current_streak = 0
        db.commit()
        db.refresh(streak)

    # Streak achievement milestones
    milestones = [3, 7, 14, 30]

    next_achievement = next(
        (
            milestone
            for milestone in milestones
            if milestone > streak.current_streak
        ),
        None
    )

    if next_achievement is None:
        days_remaining = 0
        message = "Congratulations! You completed all current streak milestones!"
    else:
        days_remaining = next_achievement - streak.current_streak
        message = f"{days_remaining} more day(s) to reach your next achievement!"

    return {
        "user_id": current_user.id,
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "last_workout_date": streak.last_workout_date,
        "next_achievement": next_achievement,
        "days_remaining": days_remaining,
        "message": message
    }
