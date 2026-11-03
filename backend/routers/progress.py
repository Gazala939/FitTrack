
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Workout, Progress, User
from dependencies import get_current_user


router = APIRouter(prefix="/progress", tags=["Daily Progress"])


def calculate_daily_progress(db: Session, user_id: int, selected_date: date):
    total_workouts = (
        db.query(func.count(Workout.id))
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date == selected_date
        )
        .scalar()
    )

    total_calories = (
        db.query(func.coalesce(func.sum(Workout.calories_burned), 0))
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date == selected_date
        )
        .scalar()
    )

    progress = (
        db.query(Progress)
        .filter(
            Progress.user_id == user_id,
            Progress.date == selected_date
        )
        .first()
    )

    if progress:
        progress.total_workouts = total_workouts
        progress.total_calories = float(total_calories)
    else:
        progress = Progress(
            user_id=user_id,
            total_workouts=total_workouts,
            total_calories=float(total_calories),
            date=selected_date
        )
        db.add(progress)

    db.commit()
    db.refresh(progress)

    return progress


# 1. View today's progress
@router.get("/today")
def get_today_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    progress = calculate_daily_progress(
        db, current_user.id, today
    )

    return progress


# 2. View progress for a selected date
@router.get("/daily")
def get_daily_progress(
    selected_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress = calculate_daily_progress(
        db, current_user.id, selected_date
    )

    return progress


# 3. View progress history
@router.get("/history")
def get_progress_history(
    days: int = Query(default=7, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    start_date = date.today() - timedelta(days=days - 1)

    workouts = (
        db.query(Workout.workout_date)
        .filter(
            Workout.user_id == current_user.id,
            Workout.workout_date >= start_date
        )
        .distinct()
        .all()
    )

    for item in workouts:
        calculate_daily_progress(
            db, current_user.id, item[0]
        )

    history = (
        db.query(Progress)
        .filter(
            Progress.user_id == current_user.id,
            Progress.date >= start_date
        )
        .order_by(Progress.date.desc())
        .all()
    )

    return history
