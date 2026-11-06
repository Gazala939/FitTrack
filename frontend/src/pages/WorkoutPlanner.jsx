
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/WorkoutPlanner.css";

export default function WorkoutPlanner() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Cardio",
    scheduled_date: "",
  });

  // Load upcoming workout plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/workout-plans/upcoming");
      setPlans(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load workout plans."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Create workout plan
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await api.post("/workout-plans/", form);

      setMessage("Workout plan created successfully!");

      setForm({
        title: "",
        description: "",
        category: "Cardio",
        scheduled_date: "",
      });

      await fetchPlans();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to create workout plan."
      );
    }
  };

  // Delete workout plan
  const handleDelete = async (planId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this workout plan?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(planId);
      setMessage("");
      setError("");

      await api.delete(`/workout-plans/${planId}`);

      setMessage("Workout plan deleted successfully!");

      await fetchPlans();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to delete workout plan."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="planner-page">

      {/* Header */}
      <header className="planner-header">
        <div>
          <h1>📅 Workout Planner</h1>
          <p>Plan your upcoming fitness activities.</p>
        </div>

        <Link to="/dashboard" className="planner-back">
          Back to Dashboard
        </Link>
      </header>

      {/* Create Workout Plan */}
      <section className="planner-form-section">

        <h2>Create Workout Plan</h2>

        {message && (
          <p className="planner-success">{message}</p>
        )}

        {error && (
          <p className="planner-error">{error}</p>
        )}

        <form onSubmit={handleSubmit}>

          {/* Workout Title */}
          <div className="planner-form-group">
            <label>Workout Title</label>

            <input
              type="text"
              name="title"
              placeholder="Example: Morning Cardio"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="planner-form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Enter workout details"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Workout Category */}
          <div className="planner-form-group">
            <label>Workout Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="Cardio">Cardio</option>
              <option value="Strength Training">
                Strength Training
              </option>
              <option value="Yoga">Yoga</option>
              <option value="Flexibility">Flexibility</option>
              <option value="HIIT">HIIT</option>
            </select>
          </div>

          {/* Scheduled Date */}
          <div className="planner-form-group">
            <label>Scheduled Date</label>

            <input
              type="date"
              name="scheduled_date"
              value={form.scheduled_date}
              onChange={handleChange}
              min={new Date().toLocaleDateString("en-CA")}
              required
            />
          </div>

          <button type="submit">
            Create Workout Plan
          </button>

        </form>
      </section>

      {/* Upcoming Workout Plans */}
      <section className="planner-list-section">

        <div className="planner-list-header">
          <h2>Upcoming Workouts</h2>

          <button onClick={fetchPlans} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading workout plans...</p>
        ) : plans.length === 0 ? (
          <p className="planner-empty">
            No upcoming workout plans found.
          </p>
        ) : (
          <div className="planner-cards">

            {plans.map((plan) => (
              <div className="planner-card" key={plan.id}>

                <h3>🏋️ {plan.title}</h3>

                <p>
                  {plan.description || "No description provided."}
                </p>

                <p>
                  <strong>Category:</strong> {plan.category}
                </p>

                <div className="planner-date">
                  📅 Scheduled Date: {plan.scheduled_date}
                </div>

                <button
                  className="planner-delete-btn"
                  onClick={() => handleDelete(plan.id)}
                  disabled={deletingId === plan.id}
                >
                  {deletingId === plan.id
                    ? "Deleting..."
                    : "Delete Plan"}
                </button>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}
