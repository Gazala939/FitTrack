import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/StreakTracking.css";

export default function StreakTracking() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const milestones = [3, 7, 14, 30];

  const fetchStreak = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/streaks/me");

      setStreak(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load streak statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  const nextMilestone =
    milestones.find((milestone) => milestone > currentStreak) || null;

  return (
    <div className="streak-page">
      <div className="streak-header">
        <div>
          <h1>Streak Tracking</h1>
          <p>Stay consistent and build a healthy workout habit!</p>
        </div>

        <button
          className="streak-refresh-btn"
          onClick={fetchStreak}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p className="streak-error">{error}</p>}

      {loading && !streak ? (
        <p className="streak-loading">Loading streak statistics...</p>
      ) : streak ? (
        <>
          <div className="streak-stats-grid">
            <div className="streak-stat-card current-card">
              <div className="streak-icon">🔥</div>
              <h3>Current Streak</h3>
              <h2>{currentStreak} Days</h2>
              <p>Keep your workout consistency going!</p>
            </div>

            <div className="streak-stat-card longest-card">
              <div className="streak-icon">🏆</div>
              <h3>Longest Streak</h3>
              <h2>{longestStreak} Days</h2>
              <p>Your personal best achievement.</p>
            </div>

            <div className="streak-stat-card last-workout-card">
              <div className="streak-icon">📅</div>
              <h3>Last Workout</h3>
              <h2>
                {streak.last_workout_date
                  ? new Date(
                      `${streak.last_workout_date}T00:00:00`
                    ).toLocaleDateString("en-IN")
                  : "No Workouts"}
              </h2>
              <p>Your most recent workout date.</p>
            </div>
          </div>

          <div className="streak-progress-section">
            <h2>Next Achievement</h2>

            {nextMilestone ? (
              <>
                <p>
                  {nextMilestone - currentStreak} more workout day
                  {nextMilestone - currentStreak === 1 ? "" : "s"} to reach{" "}
                  {nextMilestone} days!
                </p>

                <div className="streak-progress-bar">
                  <div
                    className="streak-progress-fill"
                    style={{
                      width: `${Math.min(
                        (currentStreak / nextMilestone) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                <p className="streak-progress-label">
                  {currentStreak} / {nextMilestone} days
                </p>
              </>
            ) : (
              <p>Congratulations! You've reached all the listed milestones!</p>
            )}
          </div>

          <div className="streak-achievements-section">
            <h2>🏅 Achievements</h2>

            <div className="streak-achievements-grid">
              {milestones.map((milestone) => {
                const achieved = longestStreak >= milestone;

                return (
                  <div
                    key={milestone}
                    className={`streak-achievement-card ${
                      achieved ? "achieved" : "locked"
                    }`}
                  >
                    <div className="achievement-icon">
                      {achieved ? "🏆" : "🔒"}
                    </div>

                    <h3>{milestone}-Day Streak</h3>

                    <p>
                      {achieved ? "Achievement Unlocked!" : "Not Achieved Yet"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}