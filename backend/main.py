
from fastapi import FastAPI

from database import Base, engine
from routers import auth, workouts,progress,goals,reports, notifications

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

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(progress.router)
app.include_router(goals.router)
app.include_router(reports.router)
app.include_router(notifications.router)


@app.get("/")
def home():
    return {"message": "Welcome to FitTrack API!"}
