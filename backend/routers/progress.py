
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Workout, Progress, User
from dependencies import get_current_user

from calendar import monthrange

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


# ==========================================
# PHASE 2 - MODULE 9: PROGRESS COMPARISON
# ==========================================

# Calculate workout statistics for a date range
def get_workout_statistics(db: Session, user_id: int, start_date: date, end_date: date):

    result = (
        db.query(
            func.count(Workout.id).label("total_workouts"),
            func.coalesce(func.sum(Workout.duration), 0).label("total_duration"),
            func.coalesce(func.sum(Workout.calories_burned), 0).label("total_calories")
        )
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= end_date
        )
        .first()
    )

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_workouts": result.total_workouts,
        "total_duration": int(result.total_duration),
        "total_calories": float(result.total_calories)
    }


# Calculate percentage improvement
def calculate_percentage_change(current, previous):

    if previous == 0:
        if current == 0:
            return 0
        return None

    return round(((current - previous) / previous) * 100, 2)


# 4. Weekly Progress Comparison
@router.get("/comparison/weekly")
def compare_weekly_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    # Current week: Monday to today
    current_start = today - timedelta(days=today.weekday())
    current_end = today

    # Previous week: same weekdays as current week
    previous_start = current_start - timedelta(days=7)
    previous_end = today - timedelta(days=7)

    current = get_workout_statistics(
        db, current_user.id, current_start, current_end
    )

    previous = get_workout_statistics(
        db, current_user.id, previous_start, previous_end
    )

    return {
        "comparison": "Weekly Progress",
        "current_week": current,
        "previous_week": previous,
        "improvement": {
            "workouts": calculate_percentage_change(
                current["total_workouts"],
                previous["total_workouts"]
            ),
            "duration": calculate_percentage_change(
                current["total_duration"],
                previous["total_duration"]
            ),
            "calories": calculate_percentage_change(
                current["total_calories"],
                previous["total_calories"]
            )
        }
    }


# 5. Monthly Progress Comparison
@router.get("/comparison/monthly")
def compare_monthly_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    # Current month: first day to today
    current_start = today.replace(day=1)
    current_end = today

    # Previous month: same number of elapsed days
    if today.month == 1:
        previous_year = today.year - 1
        previous_month = 12
    else:
        previous_year = today.year
        previous_month = today.month - 1

    previous_start = date(previous_year, previous_month, 1)

    previous_last_day = monthrange(
        previous_year, previous_month
    )[1]

    previous_day = min(today.day, previous_last_day)

    previous_end = date(
        previous_year, previous_month, previous_day
    )

    current = get_workout_statistics(
        db, current_user.id, current_start, current_end
    )

    previous = get_workout_statistics(
        db, current_user.id, previous_start, previous_end
    )

    return {
        "comparison": "Monthly Progress",
        "current_month": current,
        "previous_month": previous,
        "improvement": {
            "workouts": calculate_percentage_change(
                current["total_workouts"],
                previous["total_workouts"]
            ),
            "duration": calculate_percentage_change(
                current["total_duration"],
                previous["total_duration"]
            ),
            "calories": calculate_percentage_change(
                current["total_calories"],
                previous["total_calories"]
            )
        }
    }


# 6. Daily Progress Trends
@router.get("/comparison/trends")
def get_progress_trends(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    results = (
        db.query(
            Workout.workout_date,
            func.count(Workout.id).label("total_workouts"),
            func.coalesce(func.sum(Workout.duration), 0).label("total_duration"),
            func.coalesce(func.sum(Workout.calories_burned), 0).label("total_calories")
        )
        .filter(
            Workout.user_id == current_user.id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= end_date
        )
        .group_by(Workout.workout_date)
        .order_by(Workout.workout_date.asc())
        .all()
    )

    # Organize workout records by date
    daily_data = {}

    for item in results:
        daily_data[item.workout_date] = {
            "date": item.workout_date,
            "total_workouts": item.total_workouts,
            "total_duration": int(item.total_duration),
            "total_calories": float(item.total_calories)
        }

    # Include dates without workouts as zero
    trends = []

    current_date = start_date

    while current_date <= end_date:

        if current_date in daily_data:
            trends.append(daily_data[current_date])
        else:
            trends.append({
                "date": current_date,
                "total_workouts": 0,
                "total_duration": 0,
                "total_calories": 0
            })

        current_date += timedelta(days=1)

    return {
        "total_days": days,
        "start_date": start_date,
        "end_date": end_date,
        "trends": trends
    }

