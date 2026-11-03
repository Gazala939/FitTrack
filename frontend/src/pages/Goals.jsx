
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Goals.css";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    goal_type: "Weight Loss",
    target_value: "",
    current_value: "0",
    deadline: "",
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/goals/");
      setGoals(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      goal_type: "Weight Loss",
      target_value: "",
      current_value: "0",
      deadline: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const goalData = {
      goal_type: form.goal_type,
      target_value: Number(form.target_value),
      current_value: Number(form.current_value),
      deadline: form.deadline,
    };

    try {
      if (editingId) {
        await api.put(`/goals/${editingId}`, goalData);
        setMessage("Goal updated successfully!");
      } else {
        await api.post("/goals/", goalData);
        setMessage("Goal created successfully!");
      }

      resetForm();
      await fetchGoals();
    } catch (err) {
      setError(
        Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail.map((item) => item.msg).join(", ")
          : err.response?.data?.detail || "Unable to save goal."
      );
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal.id);

    setForm({
      goal_type: goal.goal_type,
      target_value: String(goal.target_value),
      current_value: String(goal.current_value),
      deadline: goal.deadline,
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (goalId) => {
    const confirmed = window.confirm("Are you sure you want to delete this goal?");

    if (!confirmed) return;

    try {
      await api.delete(`/goals/${goalId}`);
      setMessage("Goal deleted successfully!");
      setError("");

      if (editingId === goalId) {
        resetForm();
      }

      await fetchGoals();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete goal.");
    }
  };

  if (loading) {
    return <div className="goals-page">Loading goals...</div>;
  }

  return (
    <div className="goals-page">
      <header className="goals-header">
        <div>
          <h1>🎯 Goal Setting</h1>
          <p>Set your fitness targets and track your achievements.</p>
        </div>
      </header>

      <section className="goal-form-card">
        <h2>{editingId ? "Update Goal" : "Create New Goal"}</h2>

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="goal-form-group">
            <label>Goal Type</label>
            <select
              name="goal_type"
              value={form.goal_type}
              onChange={handleChange}
              required
            >
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Steps">Steps</option>
            </select>
          </div>

          <div className="goal-form-group">
            <label>Target Value</label>
            <input
              type="number"
              name="target_value"
              value={form.target_value}
              onChange={handleChange}
              placeholder="Enter target value"
              min="0.01"
              step="any"
              required
            />
          </div>

          <div className="goal-form-group">
            <label>Current Value</label>
            <input
              type="number"
              name="current_value"
              value={form.current_value}
              onChange={handleChange}
              placeholder="Enter current value"
              min="0"
              step="any"
              required
            />
          </div>

          <div className="goal-form-group">
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="goal-form-actions">
            <button type="submit" className="goal-submit-button">
              {editingId ? "Update Goal" : "Create Goal"}
            </button>

            {editingId && (
              <button
                type="button"
                className="goal-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="goal-success">{message}</p>}
        {error && <p className="goal-error">{error}</p>}
      </section>

      <section className="goals-list-section">
        <h2>My Fitness Goals</h2>

        {goals.length === 0 ? (
          <p className="no-goals">No goals created yet. Create your first goal!</p>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => (
              <div className="goal-card" key={goal.id}>
                <div className="goal-card-header">
                  <h3>{goal.goal_type}</h3>
                  <span>{goal.completion_percentage}%</span>
                </div>

                <p>
                  Current: <strong>{goal.current_value}</strong>
                </p>

                <p>
                  Target: <strong>{goal.target_value}</strong>
                </p>

                <p>
                  Deadline: <strong>{goal.deadline}</strong>
                </p>

                <div className="goal-progress-track">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${Math.min(goal.completion_percentage, 100)}%`,
                    }}
                  />
                </div>

                <div className="goal-card-actions">
                  <button onClick={() => handleEdit(goal)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(goal.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
