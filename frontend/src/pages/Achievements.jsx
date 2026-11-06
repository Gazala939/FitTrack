
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Achievements.css";

export default function Achievements() {
  const [data, setData] = useState({ total_earned: 0, badges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await api.get("/achievements/me");
        const result = response.data;
        const badges = result.badges || [];

        const saved = localStorage.getItem("fittrack_seen_badges");

        if (saved === null) {
          // First visit: remember existing badges without showing old popups
          localStorage.setItem(
            "fittrack_seen_badges",
            JSON.stringify(badges.map((badge) => badge.id))
          );
        } else {
          const seenIds = JSON.parse(saved);
          const newlyEarned = badges.find(
            (badge) => !seenIds.includes(badge.id)
          );

          if (newlyEarned) {
            setNewBadge(newlyEarned);
          }

          localStorage.setItem(
            "fittrack_seen_badges",
            JSON.stringify(badges.map((badge) => badge.id))
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load achievements."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) return <div className="achievements-page">Loading achievements...</div>;

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <div>
          <h1>🏆 Achievement Badges</h1>
          <p>Celebrate your fitness milestones and progress.</p>
        </div>
        <div className="achievement-count">
          {data.total_earned} Badges Earned
        </div>
      </div>

      {newBadge && (
        <div className="achievement-popup">
          <button
            className="achievement-popup-close"
            onClick={() => setNewBadge(null)}
          >
            ×
          </button>
          <div className="achievement-popup-icon">{newBadge.icon}</div>
          <h2>🎉 New Achievement Unlocked!</h2>
          <h3>{newBadge.name}</h3>
          <p>{newBadge.description}</p>
          <button onClick={() => setNewBadge(null)}>Awesome!</button>
        </div>
      )}

      {error && <p className="achievement-error">{error}</p>}

      {!error && data.badges.length === 0 && (
        <div className="no-achievements">
          <span>🏅</span>
          <h2>No badges earned yet</h2>
          <p>Complete workouts, maintain streaks, and achieve your goals to earn badges!</p>
        </div>
      )}

      <div className="achievement-grid">
        {data.badges.map((badge) => (
          <div className="achievement-card" key={badge.id}>
            <div className="achievement-icon">{badge.icon}</div>
            <h3>{badge.name}</h3>
            <p>{badge.description}</p>
            <span className="achievement-earned">
              Earned: {new Date(badge.earned_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
