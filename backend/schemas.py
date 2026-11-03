from typing import Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime, date

# User Registration
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# User Response
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# JWT Token Response
class Token(BaseModel):
    access_token: str
    token_type: str

class WorkoutCreate(BaseModel):
    workout_name: str = Field(min_length=2, max_length=150)
    category: Literal["Cardio", "Strength", "Yoga"]
    duration: int = Field(gt=0)
    calories_burned: float = Field(ge=0)
    workout_date: date


class WorkoutUpdate(BaseModel):
    workout_name: str | None = Field(default=None, min_length=2, max_length=150)
    category: Literal["Cardio", "Strength", "Yoga"] | None = None
    duration: int | None = Field(default=None, gt=0)
    calories_burned: float | None = Field(default=None, ge=0)
    workout_date: date | None = None


class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    workout_name: str
    category: str
    duration: int
    calories_burned: float
    workout_date: date

    model_config = ConfigDict(from_attributes=True)


class GoalCreate(BaseModel):
    goal_type: Literal["Weight Loss", "Muscle Gain", "Steps"]
    target_value: float = Field(gt=0)
    current_value: float = Field(default=0, ge=0)
    deadline: date


class GoalUpdate(BaseModel):
    goal_type: Literal["Weight Loss", "Muscle Gain", "Steps"] | None = None
    target_value: float | None = Field(default=None, gt=0)
    current_value: float | None = Field(default=None, ge=0)
    deadline: date | None = None


class GoalResponse(BaseModel):
    id: int
    user_id: int
    goal_type: str
    target_value: float
    current_value: float
    deadline: date
    created_at: datetime
    completion_percentage: float

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    message: str = Field(min_length=2, max_length=500)


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
