
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Notification, Goal, User
from schemas import NotificationCreate, NotificationResponse
from dependencies import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# 1. Create a notification
@router.post(
    "/",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_notification = Notification(
        user_id=current_user.id,
        title=notification_data.title,
        message=notification_data.message
    )

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return new_notification


# 2. View all notifications of the logged-in user
@router.get("/", response_model=list[NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return notifications


# 3. Mark a notification as read
@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification": notification
    }


# 4. Delete a notification
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    db.delete(notification)
    db.commit()

    return {"message": "Notification deleted successfully"}


# 5. Generate today's workout reminder
@router.post("/daily-reminder")
def create_daily_reminder(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    title = "Daily Workout Reminder"
    message = f"Don't forget your workout today! Date: {today}"

    # Avoid creating the same reminder more than once per day
    existing = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.title == title,
            Notification.message == message
        )
        .first()
    )

    if existing:
        return {
            "message": "Today's workout reminder already exists",
            "notification": existing
        }

    reminder = Notification(
        user_id=current_user.id,
        title=title,
        message=message
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return {
        "message": "Daily workout reminder created successfully",
        "notification": reminder
    }


# 6. Generate goal progress alerts
@router.post("/goal-alerts")
def create_goal_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = (
        db.query(Goal)
        .filter(
            Goal.user_id == current_user.id,
            Goal.current_value > 0
        )
        .all()
    )

    alerts_created = 0

    for goal in goals:
        percentage = min(
            (goal.current_value / goal.target_value) * 100,
            100
        )

        title = "Goal Progress Update"
        message = (
            f"Your {goal.goal_type} goal is "
            f"{round(percentage, 2)}% complete. "
            f"Current progress: {goal.current_value}, "
            f"Target: {goal.target_value}."
        )

        # Avoid duplicate alerts for unchanged progress
        existing = (
            db.query(Notification)
            .filter(
                Notification.user_id == current_user.id,
                Notification.title == title,
                Notification.message == message
            )
            .first()
        )

        if not existing:
            alert = Notification(
                user_id=current_user.id,
                title=title,
                message=message
            )
            db.add(alert)
            alerts_created += 1

    db.commit()

    return {
        "message": "Goal progress alerts processed successfully",
        "alerts_created": alerts_created
    }
