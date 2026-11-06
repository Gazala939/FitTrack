
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Dashboard.css";
import "../styles/PersonalizedDashboard.css";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(
    String(value).length === 10 ? `${value}T00:00:00` : value
  );

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN");
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [streak, setStreak] = useState(null);
  const [achievements, setAchievements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setDashboardError("");

      const results = await Promise.allSettled([
        api.get("/workouts/"),
        api.get("/workout-plans/upcoming"),
        api.get("/goals/"),
        api.get("/streaks/me"),
        api.get("/achievements/me")
      ]);

      let failedRequests = 0;

      if (results[0].status === "fulfilled") {
        setWorkouts(results[0].value.data);
      } else {
        failedRequests++;
      }

      if (results[1].status === "fulfilled") {
        setUpcomingWorkouts(results[1].value.data);
      } else {
        failedRequests++;
      }

      if (results[2].status === "fulfilled") {
        setGoals(results[2].value.data);
      } else {
        failedRequests++;
      }

      if (results[3].status === "fulfilled") {
        setStreak(results[3].value.data);
      } else {
        failedRequests++;
      }

      if (results[4].status === "fulfilled") {
        setAchievements(results[4].value.data.badges || []);
      } else {
        failedRequests++;
      }

      if (failedRequests > 0) {
        setDashboardError(
          `${failedRequests} dashboard section(s) could not load. Please check your connection and try again.`
        );
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  // Calculate today's workout summary
  const today = getTodayDate();

  const todaysWorkouts = workouts.filter(
    (workout) => String(workout.workout_date).slice(0, 10) === today
  );

  const totalCalories = todaysWorkouts.reduce(
    (total, workout) => total + Number(workout.calories_burned || 0),
    0
  );

  const totalDuration = todaysWorkouts.reduce(
    (total, workout) => total + Number(workout.duration || 0),
    0
  );

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <h1>FitTrack 💪</h1>
          <p>Your Fitness Management Dashboard</p>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <section className="welcome-section">
        <h2>Welcome, {user?.username || "User"}!</h2>
        <p>Let's stay healthy and achieve your fitness goals.</p>
      </section>

      {/* MODULE 12 - PERSONALIZED DASHBOARD */}

      <section className="personalized-dashboard">

        <h2>🌟 Your Personal Fitness Overview</h2>

        {loading ? (
          <p className="dashboard-loading">
            Loading your fitness information...
          </p>
        ) : (
          <>
            {dashboardError && (
              <p className="dashboard-error">{dashboardError}</p>
            )}

            {/* DAILY SUMMARY */}

            <div className="personalized-section">
              <h3>📊 Today's Summary</h3>

              <div className="summary-grid">

                <div className="summary-card">
                  <span>🏋️</span>
                  <h4>{todaysWorkouts.length}</h4>
                  <p>Workouts Completed</p>
                </div>

                <div className="summary-card">
                  <span>🔥</span>
                  <h4>{totalCalories}</h4>
                  <p>Calories Burned</p>
                </div>

                <div className="summary-card">
                  <span>⏱️</span>
                  <h4>{totalDuration}</h4>
                  <p>Minutes Exercised</p>
                </div>

              </div>
            </div>

            {/* UPCOMING WORKOUTS */}

            <div className="personalized-section">
              <h3>📅 Upcoming Workouts</h3>

              {upcomingWorkouts.length === 0 ? (
                <p className="empty-dashboard">
                  No upcoming workouts scheduled. Plan your next workout!
                </p>
              ) : (
                <div className="personalized-list">
                  {upcomingWorkouts.slice(0, 5).map((plan) => (
                    <div className="personalized-item" key={plan.id}>
                      <div>
                        <h4>{plan.title}</h4>
                        <p>{plan.description || "Workout planned"}</p>
                        <small>
                          {formatDate(plan.scheduled_date)}
                        </small>
                      </div>
                      <span>{plan.category || "Fitness"}</span>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/workout-planner" className="personalized-link">
                Manage Workout Plans →
              </Link>
            </div>

            {/* GOAL PROGRESS */}

            <div className="personalized-section">
              <h3>🎯 Your Goal Progress</h3>

              {goals.length === 0 ? (
                <p className="empty-dashboard">
                  No fitness goals found. Create your first goal!
                </p>
              ) : (
                <div className="goal-progress-list">
                  {goals.slice(0, 5).map((goal) => {
                    const percentage = Math.min(
                      Math.max(
                        Number(
                          goal.completion_percentage ??
                          (goal.target_value > 0
                            ? (goal.current_value / goal.target_value) * 100
                            : 0)
                        ),
                        0
                      ),
                      100
                    );

                    return (
                      <div className="goal-progress-item" key={goal.id}>
                        <div className="goal-progress-heading">
                          <strong>{goal.goal_type}</strong>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>

                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <small>
                          {goal.current_value} / {goal.target_value}
                          {" "} · Deadline: {formatDate(goal.deadline)}
                        </small>
                      </div>
                    );
                  })}
                </div>
              )}

              <Link to="/goals" className="personalized-link">
                Manage Goals →
              </Link>
            </div>

            {/* STREAK STATUS */}

            <div className="personalized-section">
              <h3>🔥 Your Streak Status</h3>

              <div className="streak-summary">
                <div>
                  <span>Current Streak</span>
                  <h2>{streak?.current_streak ?? 0} Days</h2>
                </div>

                <div>
                  <span>Longest Streak</span>
                  <h2>{streak?.longest_streak ?? 0} Days</h2>
                </div>
              </div>

              <p>
                {streak?.message ||
                  "Complete a workout to start your streak!"}
              </p>

              <Link to="/streaks" className="personalized-link">
                View Streak Details →
              </Link>
            </div>

            {/* ACHIEVEMENT SUMMARY */}

            <div className="personalized-section">
              <h3>🏆 Your Achievements</h3>

              <h2>{achievements.length} Badges Earned</h2>

              {achievements.length === 0 ? (
                <p className="empty-dashboard">
                  Complete workouts and goals to earn badges!
                </p>
              ) : (
                <div className="achievement-summary">
                  {achievements.slice(0, 5).map((badge) => (
                    <div className="achievement-item" key={badge.id}>
                      <span>{badge.icon || "🏆"}</span>
                      <strong>{badge.name}</strong>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/achievements" className="personalized-link">
                View All Achievements →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* EXISTING DASHBOARD MODULES */}

      <section className="dashboard-cards">

        <div className="dashboard-card">
          <h3>🏋️ Workout Management</h3>
          <p>Add, view, update and manage your workouts.</p>
          <Link to="/workouts" className="dashboard-button">
            Manage Workouts
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>📊 Daily Progress</h3>
          <p>Track your daily workouts, calories burned and fitness history.</p>
          <Link to="/progress" className="dashboard-button">
            View Progress
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>🎯 Goal Setting</h3>
          <p>Create fitness goals, track your progress and achieve your targets.</p>
          <Link to="/goals" className="dashboard-button">
            Manage Goals
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>📊 Reports & Analytics</h3>
          <p>View weekly and monthly fitness reports, workout statistics and charts.</p>
          <Link to="/reports" className="dashboard-button">
            View Reports
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>🔔 Notifications</h3>
          <p>View fitness updates, workout reminders and goal progress alerts.</p>
          <Link to="/notifications" className="dashboard-button">
            View Notifications
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>📅 Workout Planner</h3>
          <p>Schedule workouts and organize your fitness routine.</p>
          <Link to="/workout-planner" className="dashboard-button">
            Open Workout Planner
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>📅 Workout Calendar</h3>
          <p>View scheduled workouts by date and manage your schedule.</p>
          <Link to="/workout-calendar" className="dashboard-button">
            Open Workout Calendar
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>💪 Exercise Library</h3>
          <p>Explore exercises and filter by category.</p>
          <Link to="/exercise-library" className="dashboard-button">
            Explore Exercises
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>📈 Progress Comparison</h3>
          <p>Compare weekly and monthly fitness performance.</p>
          <Link to="/progress-comparison" className="dashboard-button">
            Compare Progress
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>💡 Workout Recommendations</h3>
          <p>Get recommendations based on your fitness goals.</p>
          <Link to="/recommendations" className="dashboard-button">
            View Recommendations
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>🔥 Streak Tracking</h3>
          <p>Track consecutive workout days and consistency.</p>
          <Link to="/streaks" className="dashboard-button">
            View My Streak
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>🏆 Achievement Badges</h3>
          <p>View earned badges and celebrate your milestones.</p>
          <Link to="/achievements" className="dashboard-button">
            View Achievements
          </Link>
        </div>

      </section>
    </div>
  );
}
