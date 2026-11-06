
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/ExerciseLibrary.css";

export default function ExerciseLibrary() {
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch exercises with search and category filters
  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category) {
        params.category = category;
      }

      const response = await api.get("/exercises/", { params });

      setExercises(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load exercises."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [search, category]);

  // Send selected exercise to Workout Management
  const handleAddToWorkout = (exercise) => {
    navigate("/workouts", {
      state: {
        exercise: exercise,
      },
    });
  };

  return (
    <div className="exercise-library-page">

      <header className="exercise-header">
        <div>
          <h1>💪 Exercise Library</h1>
          <p>Explore exercises and add them to your workouts.</p>
        </div>

        <button
          className="exercise-back-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </header>

      {/* Search and Filter */}
      <section className="exercise-filter-section">

        <input
          type="text"
          placeholder="Search exercises by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Cardio">Cardio</option>
          <option value="Strength Training">Strength Training</option>
          <option value="Yoga">Yoga</option>
        </select>

        <button onClick={fetchExercises}>
          Refresh
        </button>

      </section>

      {error && (
        <p className="exercise-error">{error}</p>
      )}

      {/* Exercise List */}
      <section className="exercise-list-section">

        <h2>Available Exercises</h2>

        {loading ? (
          <p>Loading exercises...</p>
        ) : exercises.length === 0 ? (
          <p className="exercise-empty">
            No exercises found.
          </p>
        ) : (

          <div className="exercise-grid">

            {exercises.map((exercise) => (

              <div
                className="exercise-card"
                key={exercise.id}
              >

                <h3>{exercise.name}</h3>

                <span className="exercise-category">
                  {exercise.category}
                </span>

                <p>
                  {exercise.description ||
                    "No description available."}
                </p>

                <div className="exercise-duration">
                  ⏱ Duration: {exercise.duration} minutes
                </div>

                <button
                  className="exercise-add-button"
                  onClick={() => handleAddToWorkout(exercise)}
                >
                  + Add to Workout
                </button>

              </div>

            ))}

          </div>
        )}

      </section>

    </div>
  );
}
