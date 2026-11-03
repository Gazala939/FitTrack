
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Workout, User
from dependencies import get_current_user


router = APIRouter(
    prefix="/reports",
    tags=["Reports & Analytics"]
)


# Common function to calculate report details
def generate_report(
    db: Session,
    user_id: int,
    start_date: date,
    end_date: date
):
    # Calculate total workouts, calories and duration
    summary = (
        db.query(
            func.count(Workout.id).label("total_workouts"),
            func.coalesce(
                func.sum(Workout.calories_burned), 0
            ).label("total_calories"),
            func.coalesce(
                func.sum(Workout.duration), 0
            ).label("total_duration")
        )
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= end_date
        )
        .first()
    )

    # Calculate category-wise workout statistics
    category_data = (
        db.query(
            Workout.category,
            func.count(Workout.id).label("total_workouts"),
            func.coalesce(
                func.sum(Workout.calories_burned), 0
            ).label("total_calories")
        )
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= end_date
        )
        .group_by(Workout.category)
        .all()
    )

    # Calculate date-wise workout statistics
    daily_data = (
        db.query(
            Workout.workout_date,
            func.count(Workout.id).label("total_workouts"),
            func.coalesce(
                func.sum(Workout.calories_burned), 0
            ).label("total_calories")
        )
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= end_date
        )
        .group_by(Workout.workout_date)
        .order_by(Workout.workout_date)
        .all()
    )

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_workouts": summary.total_workouts,
        "total_calories": float(summary.total_calories),
        "total_duration": int(summary.total_duration),
        "category_breakdown": [
            {
                "category": item.category,
                "total_workouts": item.total_workouts,
                "total_calories": float(item.total_calories)
            }
            for item in category_data
        ],
        "daily_breakdown": [
            {
                "date": item.workout_date,
                "total_workouts": item.total_workouts,
                "total_calories": float(item.total_calories)
            }
            for item in daily_data
        ]
    }


# 1. Weekly report
@router.get("/weekly")
def get_weekly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    # Monday is the first day of the week
    start_date = today - timedelta(days=today.weekday())

    return generate_report(
        db,
        current_user.id,
        start_date,
        today
    )


# 2. Monthly report
@router.get("/monthly")
def get_monthly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    # First day of the current month
    start_date = today.replace(day=1)

    return generate_report(
        db,
        current_user.id,
        start_date,
        today
    )


# 3. Workout category statistics
@router.get("/categories")
def get_category_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category_data = (
        db.query(
            Workout.category,
            func.count(Workout.id).label("total_workouts"),
            func.coalesce(
                func.sum(Workout.calories_burned), 0
            ).label("total_calories"),
            func.coalesce(
                func.sum(Workout.duration), 0
            ).label("total_duration")
        )
        .filter(Workout.user_id == current_user.id)
        .group_by(Workout.category)
        .all()
    )

    return [
        {
            "category": item.category,
            "total_workouts": item.total_workouts,
            "total_calories": float(item.total_calories),
            "total_duration": int(item.total_duration)
        }
        for item in category_data
    ]
