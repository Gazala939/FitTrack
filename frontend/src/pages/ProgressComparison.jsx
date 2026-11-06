import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import api from "../services/api";
import "../styles/ProgressComparison.css";

export default function ProgressComparison() {
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError("");

      const [weeklyResponse, monthlyResponse, trendsResponse] =
        await Promise.all([
          api.get("/progress/comparison/weekly"),
          api.get("/progress/comparison/monthly"),
          api.get("/progress/comparison/trends?days=30"),
        ]);

      setWeekly(weeklyResponse.data);
      setMonthly(monthlyResponse.data);
      setTrends(trendsResponse.data.trends || []);
    } catch (err) {
      console.error("Progress comparison error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load progress comparison data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const formatImprovement = (value) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const renderStats = (data) => (
    <div className="comparison-stats">
      <div className="comparison-stat">
        <span>Total Workouts</span>
        <h3>{data.total_workouts}</h3>
      </div>

      <div className="comparison-stat">
        <span>Total Duration</span>
        <h3>{data.total_duration} min</h3>
      </div>

      <div className="comparison-stat">
        <span>Calories Burned</span>
        <h3>{data.total_calories}</h3>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="comparison-page">
        <p className="comparison-loading">Loading progress comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison-page">
        <h2>Progress Comparison</h2>
        <p className="comparison-error">{error}</p>
        <button onClick={fetchComparisonData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="comparison-page">
      <div className="comparison-header">
        <div>
          <h1>Progress Comparison 📊</h1>
          <p>Compare your fitness performance and track improvements.</p>
        </div>

        <button onClick={fetchComparisonData}>
          Refresh Data
        </button>
      </div>

      {/* Weekly Comparison */}
      {weekly && (
        <section className="comparison-section">
          <h2>Weekly Progress</h2>

          <div className="comparison-periods">
            <div className="period-card">
              <h3>Current Week</h3>
              <p>
                {weekly.current_week.start_date} to{" "}
                {weekly.current_week.end_date}
              </p>
              {renderStats(weekly.current_week)}
            </div>

            <div className="period-card">
              <h3>Previous Week</h3>
              <p>
                {weekly.previous_week.start_date} to{" "}
                {weekly.previous_week.end_date}
              </p>
              {renderStats(weekly.previous_week)}
            </div>
          </div>

          <div className="improvement-card">
            <h3>Weekly Improvement</h3>
            <div className="improvement-values">
              <p>
                Workouts:{" "}
                <strong>
                  {formatImprovement(weekly.improvement.workouts)}
                </strong>
              </p>
              <p>
                Duration:{" "}
                <strong>
                  {formatImprovement(weekly.improvement.duration)}
                </strong>
              </p>
              <p>
                Calories:{" "}
                <strong>
                  {formatImprovement(weekly.improvement.calories)}
                </strong>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Monthly Comparison */}
      {monthly && (
        <section className="comparison-section">
          <h2>Monthly Progress</h2>

          <div className="comparison-periods">
            <div className="period-card">
              <h3>Current Month</h3>
              <p>
                {monthly.current_month.start_date} to{" "}
                {monthly.current_month.end_date}
              </p>
              {renderStats(monthly.current_month)}
            </div>

            <div className="period-card">
              <h3>Previous Month</h3>
              <p>
                {monthly.previous_month.start_date} to{" "}
                {monthly.previous_month.end_date}
              </p>
              {renderStats(monthly.previous_month)}
            </div>
          </div>

          <div className="improvement-card">
            <h3>Monthly Improvement</h3>
            <div className="improvement-values">
              <p>
                Workouts:{" "}
                <strong>
                  {formatImprovement(monthly.improvement.workouts)}
                </strong>
              </p>
              <p>
                Duration:{" "}
                <strong>
                  {formatImprovement(monthly.improvement.duration)}
                </strong>
              </p>
              <p>
                Calories:{" "}
                <strong>
                  {formatImprovement(monthly.improvement.calories)}
                </strong>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Daily Trends */}
      <section className="comparison-section">
        <h2>30-Day Workout Trends</h2>
        <p className="comparison-description">
          Track your daily workouts, workout duration and calories burned.
        </p>

        <div className="trend-chart-card">
          <h3>Daily Workouts</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total_workouts"
                name="Workouts"
                fill="#2563eb"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="trend-chart-card">
          <h3>Daily Calories Burned</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_calories"
                name="Calories"
                stroke="#16a34a"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="trend-chart-card">
          <h3>Daily Workout Duration</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_duration"
                name="Duration (minutes)"
                stroke="#9333ea"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}