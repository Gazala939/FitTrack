
from fastapi import FastAPI

from database import Base, engine

# Import models before creating tables
import models

from routers import (
    auth,
    workouts,
    progress,
    goals,
    reports,
    notifications,
    workout_plans,
    exercises,
    recommendations,
    streaks,
    achievements
)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FitTrack API",
    description="Fitness and Workout Management Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Existing routers
app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(progress.router)
app.include_router(goals.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(workout_plans.router)
app.include_router(exercises.router)
app.include_router(recommendations.router)
app.include_router(streaks.router)
app.include_router(achievements.router)


@app.get("/")
def home():
    return {"message": "Welcome to FitTrack API!"}
