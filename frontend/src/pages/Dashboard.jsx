
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();

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

      <section className="dashboard-cards">

        {/* Workout Management */}
        <div className="dashboard-card">
          <h3>🏋️ Workout Management</h3>
          <p>Add, view, update and manage your workouts.</p>

          <Link to="/workouts" className="dashboard-button">
            Manage Workouts
          </Link>
        </div>

        {/* Daily Progress */}
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
          <p>
            View your fitness updates, workout reminders,
            and goal progress alerts.
          </p>
          <Link to="/notifications" className="dashboard-button">
            View Notifications
          </Link>
        </div>

      </section>

    </div>
  );
}
