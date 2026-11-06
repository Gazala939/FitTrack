from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
from models import WorkoutPlan, User
from schemas import WorkoutPlanCreate, WorkoutPlanResponse
from dependencies import get_current_user


router = APIRouter(
    prefix="/workout-plans",
    tags=["Workout Plans"]
)


# 1. Create a new workout plan
@router.post(
    "/",
    response_model=WorkoutPlanResponse,
    status_code=status.HTTP_201_CREATED
)
def create_workout_plan(
    plan_data: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_plan = WorkoutPlan(
        user_id=current_user.id,
        title=plan_data.title,
        description=plan_data.description,
        category=plan_data.category,
        scheduled_date=plan_data.scheduled_date
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


# 2. View upcoming workout plans
@router.get(
    "/upcoming",
    response_model=list[WorkoutPlanResponse]
)
def get_upcoming_workout_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upcoming_plans = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.user_id == current_user.id,
            WorkoutPlan.scheduled_date >= date.today()
        )
        .order_by(WorkoutPlan.scheduled_date.asc())
        .all()
    )

    return upcoming_plans


# 3. Delete a workout plan
@router.delete("/{plan_id}")
def delete_workout_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id
        )
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )

    db.delete(plan)
    db.commit()

    return {
        "message": "Workout plan deleted successfully"
    }