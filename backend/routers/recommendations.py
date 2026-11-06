from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import Exercise, Workout, Goal

router = APIRouter(
    prefix="/recommendations",
    tags=["Workout Recommendations"]
)


@router.get("/")
def get_workout_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Step 1: Get the user's fitness goals
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    goal_types = [
        goal.goal_type.lower()
        for goal in goals
        if goal.goal_type
    ]

    # Step 2: Check workouts from the last 7 days
    seven_days_ago = date.today() - timedelta(days=7)

    recent_workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= seven_days_ago
    ).all()

    # Count workouts by category
    category_counts = {}

    for workout in recent_workouts:
        category = workout.category

        if category:
            category_counts[category] = (
                category_counts.get(category, 0) + 1
            )

    # Step 3: Choose categories based on fitness goals
    preferred_categories = []

    for goal_type in goal_types:
        if any(word in goal_type for word in [
            "weight loss", "fat loss", "cardio", "endurance"
        ]):
            preferred_categories.append("Cardio")

        elif any(word in goal_type for word in [
            "muscle", "strength", "gain"
        ]):
            preferred_categories.append("Strength Training")

        elif any(word in goal_type for word in [
            "flexibility", "yoga", "stress"
        ]):
            preferred_categories.append("Yoga")

    # Remove duplicate categories
    preferred_categories = list(dict.fromkeys(preferred_categories))

    # Step 4: If no goal matches, recommend less-used categories
    if not preferred_categories:
        preferred_categories = sorted(
            ["Cardio", "Strength Training", "Yoga"],
            key=lambda category: category_counts.get(category, 0)
        )

    # Step 5: Get exercises from the Exercise Library
    exercises = db.query(Exercise).all()

    # Step 6: Prepare recommendations
    recommendations = []

    for category in preferred_categories:
        matching_exercises = [
            exercise
            for exercise in exercises
            if exercise.category == category
        ]

        for exercise in matching_exercises:
            recommendations.append({
                "id": exercise.id,
                "name": exercise.name,
                "category": exercise.category,
                "description": exercise.description,
                "duration": exercise.duration,
                "reason": (
                    f"Recommended based on your fitness goals "
                    f"and {category} training."
                )
            })

    # Add other exercises if fewer than 5 recommendations exist
    recommended_ids = {
        exercise["id"] for exercise in recommendations
    }

    for exercise in exercises:
        if len(recommendations) >= 5:
            break

        if exercise.id not in recommended_ids:
            recommendations.append({
                "id": exercise.id,
                "name": exercise.name,
                "category": exercise.category,
                "description": exercise.description,
                "duration": exercise.duration,
                "reason": "Suggested from your Exercise Library."
            })

    return {
        "message": "Workout recommendations generated successfully",
        "user_id": current_user.id,
        "fitness_goals": goal_types,
        "recent_workouts_count": len(recent_workouts),
        "recommendations": recommendations[:5]
    }