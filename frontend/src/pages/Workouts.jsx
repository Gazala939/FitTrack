
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Workouts.css";

export default function Workouts() {
  const location = useLocation();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    workout_name: "",
    category: "Cardio",
    duration: "",
    calories_burned: "",
    workout_date: new Date().toISOString().split("T")[0],
  };

  const [form, setForm] = useState(emptyForm);

  // Get all workouts
  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/workouts/");
      setWorkouts(response.data);
      setError("");
    } catch (err) {
      setError("Unable to load workouts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Receive exercise from Exercise Library
  useEffect(() => {
    const exercise = location.state?.exercise;

    if (!exercise) return;

    setEditingId(null);

    setForm({
      workout_name: exercise.name,
      category: exercise.category,
      duration: exercise.duration,
      calories_burned: "",
      workout_date: new Date().toISOString().split("T")[0],
    });

    setError("");

    // Clear navigation state so the form is not prefilled again on refresh
    navigate(location.pathname, {
      replace: true,
      state: null,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.state, location.pathname, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add or update workout
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const workoutData = {
      ...form,
      duration: Number(form.duration),
      calories_burned: Number(form.calories_burned),
    };

    try {
      if (editingId) {
        await api.put(`/workouts/${editingId}`, workoutData);
        alert("Workout updated successfully!");
      } else {
        await api.post("/workouts/", workoutData);
        alert("Workout added successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchWorkouts();

    } catch (err) {
      console.error("Save workout error:", err.response?.data || err);

      const detail = err.response?.data?.detail;

      setError(
        Array.isArray(detail)
          ? detail.map((item) =>
              `${item.loc?.join(".")}: ${item.msg}`
            ).join(", ")
          : typeof detail === "string"
          ? detail
          : JSON.stringify(err.response?.data || err.message)
      );
    }
  };

  // Load workout into the form for editing
  const handleEdit = (workout) => {
    setEditingId(workout.id);

    setForm({
      workout_name: workout.workout_name,
      category: workout.category,
      duration: workout.duration,
      calories_burned: workout.calories_burned,
      workout_date: workout.workout_date,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // Delete workout
  const handleDelete = async (workoutId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this workout?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/workouts/${workoutId}`);

      alert("Workout deleted successfully!");

      if (editingId === workoutId) {
        handleCancel();
      }

      fetchWorkouts();

    } catch (err) {
      setError("Unable to delete workout.");
    }
  };

  return (
    <div className="workouts-page">

      <h1>Workout Management</h1>
      <p>Track and manage your daily fitness activities.</p>

      {/* Workout Form */}
      <div className="workout-form-card">

        <h2>
          {editingId ? "Edit Workout" : "Add New Workout"}
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="workout_name"
            placeholder="Workout Name"
            value={form.workout_name}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="Cardio">Cardio</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Yoga">Yoga</option>
            <option value="Flexibility">Flexibility</option>
            <option value="HIIT">HIIT</option>
          </select>

          <input
            type="number"
            name="duration"
            placeholder="Duration (minutes)"
            value={form.duration}
            onChange={handleChange}
            min="1"
            required
          />

          <input
            type="number"
            name="calories_burned"
            placeholder="Calories Burned"
            value={form.calories_burned}
            onChange={handleChange}
            min="0"
            step="0.1"
            required
          />

          <input
            type="date"
            name="workout_date"
            value={form.workout_date}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editingId ? "Update Workout" : "Add Workout"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}

        </form>

        {error && (
          <p className="workout-error">{error}</p>
        )}

      </div>

      {/* Workout List */}
      <div className="workout-list-card">

        <h2>My Workouts</h2>

        {loading ? (
          <p>Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <p>No workouts found. Add your first workout!</p>
        ) : (

          <div className="workout-list">

            {workouts.map((workout) => (

              <div className="workout-item" key={workout.id}>

                <h3>{workout.workout_name}</h3>

                <p>
                  <span>Category</span>
                  <strong>{workout.category}</strong>
                </p>

                <p>
                  <span>Duration</span>
                  <strong>{workout.duration} minutes</strong>
                </p>

                <p>
                  <span>Calories</span>
                  <strong>{workout.calories_burned} kcal</strong>
                </p>

                <p>
                  <span>Date</span>
                  <strong>{workout.workout_date}</strong>
                </p>

                <div className="workout-actions">

                  <button
                    className="edit-button"
                    onClick={() => handleEdit(workout)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(workout.id)}
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}
