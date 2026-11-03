
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import api from "../services/api";
import "../styles/Reports.css";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

export default function Reports() {
  const [reportType, setReportType] = useState("weekly");
  const [report, setReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        reportType === "weekly"
          ? "/reports/weekly"
          : "/reports/monthly";

      const [reportResponse, categoryResponse] = await Promise.all([
        api.get(endpoint),
        api.get("/reports/categories"),
      ]);

      setReport(reportResponse.data);
      setCategories(categoryResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType]);

  if (loading) {
    return <div className="reports-page">Loading reports...</div>;
  }

  if (error) {
    return <div className="reports-page reports-error">{error}</div>;
  }

  const dailyChartData = (report?.daily_breakdown || []).map((item) => ({
    ...item,
    date: String(item.date).slice(5),
  }));

  const categoryChartData = (report?.category_breakdown || []).map(
    (item) => ({
      name: item.category,
      value: item.total_workouts,
    })
  );

  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1>📊 Reports & Analytics</h1>
        <p>Understand your fitness performance and progress.</p>
      </header>

      <div className="reports-filter">
        <button
          className={reportType === "weekly" ? "active" : ""}
          onClick={() => setReportType("weekly")}
        >
          Weekly Report
        </button>

        <button
          className={reportType === "monthly" ? "active" : ""}
          onClick={() => setReportType("monthly")}
        >
          Monthly Report
        </button>
      </div>

      <section className="reports-summary">
        <div className="report-stat-card">
          <span>Total Workouts</span>
          <h2>{report?.total_workouts ?? 0}</h2>
        </div>

        <div className="report-stat-card">
          <span>Calories Burned</span>
          <h2>{report?.total_calories ?? 0}</h2>
          <p>kcal</p>
        </div>

        <div className="report-stat-card">
          <span>Total Duration</span>
          <h2>{report?.total_duration ?? 0}</h2>
          <p>minutes</p>
        </div>
      </section>

      <section className="report-chart-card">
        <h2>Daily Workout Activity</h2>

        {dailyChartData.length === 0 ? (
          <p className="reports-empty">No workout data available for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis allowDecimals={false} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="total_workouts" fill="#3b82f6" name="Workouts" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="report-chart-card">
        <h2>Workout Category Breakdown</h2>

        {categoryChartData.length === 0 ? (
          <p className="reports-empty">No category data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryChartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="report-category-section">
        <h2>All-Time Category Statistics</h2>

        {categories.length === 0 ? (
          <p className="reports-empty">No category statistics available.</p>
        ) : (
          <div className="report-category-grid">
            {categories.map((item) => (
              <div className="report-category-card" key={item.category}>
                <h3>{item.category}</h3>
                <p>Workouts: <strong>{item.total_workouts}</strong></p>
                <p>Calories: <strong>{item.total_calories} kcal</strong></p>
                <p>Duration: <strong>{item.total_duration} min</strong></p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
