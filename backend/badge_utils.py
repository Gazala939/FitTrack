from datetime import date, timedelta

from models import Badge, UserBadge, Workout


# Available achievement badges
BADGE_DEFINITIONS = [
    {
        "name": "First Workout",
        "description": "Completed your first workout.",
        "icon": "🥇"
    },
    {
        "name": "Fitness Starter",
        "description": "Completed 10 workouts.",
        "icon": "🏅"
    },
    {
        "name": "Fitness Champion",
        "description": "Completed 50 workouts.",
        "icon": "💪"
    },
    {
        "name": "Fitness Legend",
        "description": "Completed 100 workouts.",
        "icon": "👑"
    },
    {
        "name": "3-Day Streak",
        "description": "Maintained a workout streak for 3 days.",
        "icon": "🔥"
    },
    {
        "name": "7-Day Streak",
        "description": "Maintained a workout streak for 7 days.",
        "icon": "⚡"
    },
    {
        "name": "14-Day Streak",
        "description": "Maintained a workout streak for 14 days.",
        "icon": "🌟"
    },
    {
        "name": "30-Day Streak",
        "description": "Maintained a workout streak for 30 days.",
        "icon": "🏆"
    },
    {
        "name": "Goal Achiever",
        "description": "Successfully achieved a fitness goal.",
        "icon": "🎯"
    }
]


# Award one badge to a user
def award_badge(db, user_id, badge_name):

    badge_details = next(
        (
            item for item in BADGE_DEFINITIONS
            if item["name"] == badge_name
        ),
        None
    )

    if not badge_details:
        return False

    badge = (
        db.query(Badge)
        .filter(Badge.name == badge_name)
        .first()
    )

    # Create badge if it does not exist
    if not badge:
        badge = Badge(
            name=badge_details["name"],
            description=badge_details["description"],
            icon=badge_details["icon"]
        )

        db.add(badge)
        db.flush()

    # Check whether user already earned this badge
    existing_badge = (
        db.query(UserBadge)
        .filter(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge.id
        )
        .first()
    )

    if existing_badge:
        return False

    user_badge = UserBadge(
        user_id=user_id,
        badge_id=badge.id
    )

    db.add(user_badge)
    db.flush()

    return True


# Check workout milestone badges
def check_workout_badges(db, user_id):

    total_workouts = (
        db.query(Workout)
        .filter(Workout.user_id == user_id)
        .count()
    )

    newly_earned = []

    workout_milestones = {
        1: "First Workout",
        10: "Fitness Starter",
        50: "Fitness Champion",
        100: "Fitness Legend"
    }

    for milestone, badge_name in workout_milestones.items():

        if total_workouts >= milestone:

            awarded = award_badge(
                db,
                user_id,
                badge_name
            )

            if awarded:
                newly_earned.append(badge_name)

    return newly_earned


# Check streak milestone badges
def check_streak_badges(db, user_id):

    workout_dates = (
        db.query(Workout.workout_date)
        .filter(Workout.user_id == user_id)
        .distinct()
        .order_by(Workout.workout_date.asc())
        .all()
    )

    dates = [item[0] for item in workout_dates]

    longest_streak = 0
    running_streak = 0

    previous_date = None

    for workout_date in dates:

        if (
            previous_date is not None
            and (workout_date - previous_date).days == 1
        ):
            running_streak += 1
        else:
            running_streak = 1

        longest_streak = max(
            longest_streak,
            running_streak
        )

        previous_date = workout_date

    newly_earned = []

    streak_milestones = {
        3: "3-Day Streak",
        7: "7-Day Streak",
        14: "14-Day Streak",
        30: "30-Day Streak"
    }

    for milestone, badge_name in streak_milestones.items():

        if longest_streak >= milestone:

            awarded = award_badge(
                db,
                user_id,
                badge_name
            )

            if awarded:
                newly_earned.append(badge_name)

    return newly_earned