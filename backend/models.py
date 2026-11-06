
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    Text
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


# 1. USERS TABLE
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    workouts = relationship("Workout", back_populates="user")
    progress = relationship("Progress", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

    # Phase 2 - Module 7
    workout_plans = relationship(
        "WorkoutPlan",
        back_populates="user"
    )


# 2. WORKOUTS TABLE
class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    duration = Column(Integer, nullable=False)
    calories_burned = Column(Float, nullable=False)
    workout_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="workouts")


# 3. PROGRESS TABLE
class Progress(Base):
    __tablename__ = "progress"

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="unique_user_progress_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_workouts = Column(Integer, default=0)
    total_calories = Column(Float, default=0)
    date = Column(Date, nullable=False)

    user = relationship("User", back_populates="progress")


# 4. GOALS TABLE
class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_type = Column(String(50), nullable=False)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0)
    deadline = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="goals")


# 5. NOTIFICATIONS TABLE
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="notifications")


# 6. WORKOUT PLANS TABLE
# Phase 2 - Module 7 and Module 8
class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    # Module 8 - Workout Category
    category = Column(
        String(50),
        nullable=False,
        default="Cardio"
    )

    scheduled_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="workout_plans")
    
    

# 7. EXERCISES TABLE
# Phase 2 - Module 8: Exercise Library

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(150),
        nullable=False
    )

    category = Column(
        String(50),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    duration = Column(
        Integer,
        nullable=False
    )

# 8. STREAK TRACKING TABLE
# Module 10 - Streak Tracking System

class Streak(Base):
    __tablename__ = "streaks"

    __table_args__ = (
        UniqueConstraint("user_id", name="unique_user_streak"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    current_streak = Column(Integer, default=0, nullable=False)

    longest_streak = Column(Integer, default=0, nullable=False)

    last_workout_date = Column(Date, nullable=True)
    
# 9. BADGES TABLE
# Module 11 - Achievement Badges

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    description = Column(
        String(500),
        nullable=False
    )

    icon = Column(
        String(100),
        nullable=False
    )


# 10. USER BADGES TABLE
# Stores badges earned by individual users

class UserBadge(Base):
    __tablename__ = "user_badges"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "badge_id",
            name="unique_user_badge"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    badge_id = Column(
        Integer,
        ForeignKey("badges.id"),
        nullable=False
    )

    earned_at = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    badge = relationship("Badge")