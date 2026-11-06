
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Exercise, User
from schemas import (
    ExerciseCreate,
    ExerciseResponse,
    EXERCISE_CATEGORIES
)
from dependencies import get_current_user


router = APIRouter(
    prefix="/exercises",
    tags=["Exercise Library"]
)


# 1. ADD NEW EXERCISE
@router.post("/", response_model=ExerciseResponse, status_code=201)
def create_exercise(
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_exercise = Exercise(
        name=exercise_data.name,
        category=exercise_data.category,
        description=exercise_data.description,
        duration=exercise_data.duration
    )

    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)

    return new_exercise


# 2. VIEW AND SEARCH EXERCISES
@router.get("/", response_model=list[ExerciseResponse])
def get_exercises(
    search: str | None = Query(default=None),
    category: EXERCISE_CATEGORIES | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Exercise)

    # Search exercises by name
    if search:
        query = query.filter(
            Exercise.name.ilike(f"%{search}%")
        )

    # Filter exercises by category
    if category:
        query = query.filter(
            Exercise.category == category
        )

    return query.order_by(Exercise.name.asc()).all()


# 3. GET EXERCISE BY ID
@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise_by_id(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id
    ).first()

    if not exercise:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )

    return exercise
