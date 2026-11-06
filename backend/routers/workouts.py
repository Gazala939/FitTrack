
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Workout, User, Streak
from schemas import WorkoutCreate, WorkoutUpdate, WorkoutResponse
from dependencies import get_current_user

from badge_utils import (
    check_workout_badges,
    check_streak_badges
)

router = APIRouter(prefix="/workouts", tags=["Workouts"])


# Calculate and save a user's current and longest streak
def update_user_streak(db: Session, user_id: int):
    workout_dates = (
        db.query(Workout.workout_date)
        .filter(Workout.user_id == user_id)
        .distinct()
        .order_by(Workout.workout_date.asc())
        .all()
    )

    dates = [row[0] for row in workout_dates]

    # Get today's date
    today = date.today()

    # Find or create the user's streak record
    streak = (
        db.query(Streak)
        .filter(Streak.user_id == user_id)
        .first()
    )

    if not streak:
        streak = Streak(
            user_id=user_id,
            current_streak=0,
            longest_streak=0,
            last_workout_date=None
        )
        db.add(streak)

    # No workouts yet
    if not dates:
        streak.current_streak = 0
        streak.longest_streak = 0
        streak.last_workout_date = None
        db.flush()
        return streak

    # Calculate longest streak
    longest_streak = 1
    temp_streak = 1

    for index in range(1, len(dates)):
        if dates[index] == dates[index - 1] + timedelta(days=1):
            temp_streak += 1
        else:
            temp_streak = 1

        longest_streak = max(longest_streak, temp_streak)

    # Calculate current streak
    latest_date = dates[-1]
    current_streak = 0

    # A streak is active if the latest workout was today or yesterday
    if latest_date == today or latest_date == today - timedelta(days=1):
        current_streak = 1

        check_date = latest_date - timedelta(days=1)

        while check_date in dates:
            current_streak += 1
            check_date -= timedelta(days=1)

    # Save streak information
    streak.current_streak = current_streak
    streak.longest_streak = longest_streak
    streak.last_workout_date = latest_date

    db.flush()

    return streak


# 1. Add a new workout
@router.post(
    "/",
    response_model=WorkoutResponse,
    status_code=status.HTTP_201_CREATED
)
def create_workout(
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_workout = Workout(
        user_id=current_user.id,
        workout_name=workout_data.workout_name,
        category=workout_data.category,
        duration=workout_data.duration,
        calories_burned=workout_data.calories_burned,
        workout_date=workout_data.workout_date
    )

    db.add(new_workout)
    db.flush()

    # Update streak information
    update_user_streak(db, current_user.id)

    # Check workout milestone badges
    check_workout_badges(db, current_user.id)

    # Check streak milestone badges
    check_streak_badges(db, current_user.id)

    db.commit()
    db.refresh(new_workout)

    return new_workout


# 2. View all workouts belonging to the logged-in user
@router.get("/", response_model=list[WorkoutResponse])
def get_my_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workouts = (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.workout_date.desc())
        .all()
    )

    return workouts


# 3. View one workout by ID
@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workout = (
        db.query(Workout)
        .filter(
            Workout.id == workout_id,
            Workout.user_id == current_user.id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )

    return workout


# 4. Update a workout
@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: int,
    workout_data: WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workout = (
        db.query(Workout)
        .filter(
            Workout.id == workout_id,
            Workout.user_id == current_user.id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )

    update_data = workout_data.model_dump(
        exclude_unset=True,
        exclude_none=True
    )

    for field, value in update_data.items():
        setattr(workout, field, value)

    # Recalculate streak after updating workout
    update_user_streak(db, current_user.id)

    db.commit()
    db.refresh(workout)

    return workout


# 5. Delete a workout
@router.delete("/{workout_id}")
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workout = (
        db.query(Workout)
        .filter(
            Workout.id == workout_id,
            Workout.user_id == current_user.id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )

    db.delete(workout)
    db.flush()

    # Recalculate streak after deleting workout
    update_user_streak(db, current_user.id)

    db.commit()

    return {"message": "Workout deleted successfully"}
