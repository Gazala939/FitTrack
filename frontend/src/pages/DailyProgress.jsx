
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/DailyProgress.css";

export default function DailyProgress() {
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const [todayResponse, historyResponse] = await Promise.all([
        api.get("/progress/today"),
        api.get("/progress/history?days=7"),
      ]);

      setProgress(todayResponse.data);
      setHistory(historyResponse.data);
    } catch (err) {
      setError("Unable to load daily progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return <div className="progress-page">Loading daily progress...</div>;
  }

  if (error) {
    return <div className="progress-page progress-error">{error}</div>;
  }

  return (
    <div className="progress-page">
      <h1>Daily Progress</h1>
      <p className="progress-subtitle">
        Monitor your fitness activities and daily achievements.
      </p>

      <div className="progress-summary">
        <div className="progress-card">
          <span>Total Workouts</span>
          <h2>{progress?.total_workouts ?? 0}</h2>
          <p>Today's workouts</p>
        </div>

        <div className="progress-card">
          <span>Calories Burned</span>
          <h2>{progress?.total_calories ?? 0}</h2>
          <p>Today's calories</p>
        </div>
      </div>

      <div className="progress-history-card">
        <h2>Last 7 Days History</h2>

        {history.length === 0 ? (
          <p>No workout history available yet.</p>
        ) : (
          <div className="progress-history-list">
            {history.map((item, index) => (
              <div
                className="progress-history-item"
                key={item.id ?? item.date ?? index}
              >
                <div>
                  <h3>{item.date}</h3>
                  <p>{item.total_workouts} workouts</p>
                </div>

                <strong>{item.total_calories} kcal</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="progress-refresh-button" onClick={fetchProgress}>
        Refresh Progress
      </button>
    </div>
  );
}
