from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Goal, User
from schemas import GoalCreate, GoalUpdate
from dependencies import get_current_user
from badge_utils import award_badge


router = APIRouter(prefix="/goals", tags=["Goal Setting"])


# Calculate goal completion percentage
def format_goal(goal: Goal):
    if goal.target_value <= 0:
        percentage = 0
    else:
        percentage = min(
            (goal.current_value / goal.target_value) * 100,
            100
        )

    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "goal_type": goal.goal_type,
        "target_value": goal.target_value,
        "current_value": goal.current_value,
        "deadline": goal.deadline,
        "created_at": goal.created_at,
        "completion_percentage": round(percentage, 2)
    }


# Check whether a goal is completed
def check_goal_achievement(db: Session, goal: Goal):

    if (
        goal.target_value > 0
        and goal.current_value >= goal.target_value
    ):
        return award_badge(
            db,
            goal.user_id,
            "Goal Achiever"
        )

    return False


# 1. Create a goal
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_goal = Goal(
        user_id=current_user.id,
        goal_type=goal_data.goal_type,
        target_value=goal_data.target_value,
        current_value=goal_data.current_value,
        deadline=goal_data.deadline
    )

    db.add(new_goal)
    db.flush()

    check_goal_achievement(db, new_goal)

    db.commit()
    db.refresh(new_goal)

    return format_goal(new_goal)


# 2. View all goals belonging to the logged-in user
@router.get("/")
def get_my_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
        .all()
    )

    return [format_goal(goal) for goal in goals]


# 3. View one goal by ID
@router.get("/{goal_id}")
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    return format_goal(goal)


# 4. Update a goal
@router.put("/{goal_id}")
def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    update_data = goal_data.model_dump(
        exclude_unset=True,
        exclude_none=True
    )

    for field, value in update_data.items():
        setattr(goal, field, value)

    check_goal_achievement(db, goal)

    db.commit()
    db.refresh(goal)

    return format_goal(goal)


# 5. Delete a goal
@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    db.delete(goal)
    db.commit()

    return {"message": "Goal deleted successfully"}