import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/WorkoutRecommendations.css";

export default function WorkoutRecommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recommendations/");
      setData(response.data);
    } catch (err) {
      console.error("Recommendation error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load workout recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleAddToWorkout = (exercise) => {
    navigate("/workouts", {
      state: {
        exercise: exercise,
      },
    });
  };

  if (loading) {
    return (
      <div className="recommendations-page">
        <p className="recommendations-loading">
          Finding workouts for you...
        </p>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <div>
          <h1>Workout Recommendations 💡</h1>
          <p>
            Discover exercises based on your fitness goals
            and workout history.
          </p>
        </div>

        <button onClick={fetchRecommendations}>
          Refresh Recommendations
        </button>
      </div>

      {error && (
        <p className="recommendations-error">{error}</p>
      )}

      {data && (
        <>
          <div className="recommendation-summary">
            <div className="recommendation-summary-card">
              <span>Your Fitness Goals</span>
              <h3>
                {data.fitness_goals?.length
                  ? data.fitness_goals.join(", ")
                  : "General Fitness"}
              </h3>
            </div>

            <div className="recommendation-summary-card">
              <span>Recent Workouts</span>
              <h3>{data.recent_workouts_count}</h3>
            </div>

            <div className="recommendation-summary-card">
              <span>Recommended Exercises</span>
              <h3>{data.recommendations?.length || 0}</h3>
            </div>
          </div>

          <section className="recommendation-list-section">
            <h2>Recommended Exercises</h2>
            <p>
              These exercises are selected from your Exercise Library.
            </p>

            {data.recommendations?.length > 0 ? (
              <div className="recommendation-grid">
                {data.recommendations.map((exercise) => (
                  <div
                    className="recommendation-card"
                    key={exercise.id}
                  >
                    <div className="recommendation-card-top">
                      <span className="recommendation-icon">
                        💪
                      </span>

                      <span className="recommendation-category">
                        {exercise.category}
                      </span>
                    </div>

                    <h3>{exercise.name}</h3>

                    <p className="recommendation-description">
                      {exercise.description ||
                        "No description available."}
                    </p>

                    <div className="recommendation-duration">
                      <span>⏱️ Duration</span>
                      <strong>{exercise.duration} minutes</strong>
                    </div>

                    <div className="recommendation-reason">
                      <strong>Why recommended?</strong>
                      <p>{exercise.reason}</p>
                    </div>

                    <button
                      className="recommendation-button"
                      onClick={() => handleAddToWorkout(exercise)}
                    >
                      Add to Workout
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-recommendations">
                <h3>No recommendations available</h3>
                <p>
                  Add exercises to your Exercise Library to receive
                  workout recommendations.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}