
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/WorkoutCalendar.css";

export default function WorkoutCalendar() {
  const [plans, setPlans] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch upcoming workout plans
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

  // Move to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Move to next month
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get first weekday of current month
  const firstDay = new Date(year, month, 1).getDay();

  // Create calendar cells
  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  // Get workouts scheduled for a particular date
  const getPlansForDate = (day) => {
    const dateString = [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

    return plans.filter(
      (plan) => plan.scheduled_date === dateString
    );
  };

  const today = new Date();

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div>
          <h1>📅 Workout Calendar</h1>
          <p>View your scheduled workouts by date.</p>
        </div>

        <Link to="/dashboard" className="calendar-back">
          Back to Dashboard
        </Link>
      </header>

      <section className="calendar-section">
        <div className="calendar-month-header">
          <button onClick={previousMonth}>
            ❮
          </button>

          <h2>
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button onClick={nextMonth}>
            ❯
          </button>
        </div>

        {error && (
          <p className="calendar-error">{error}</p>
        )}

        {loading ? (
          <p>Loading calendar...</p>
        ) : (
          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    className="calendar-day empty-day"
                    key={`empty-${index}`}
                  />
                );
              }

              const dayPlans = getPlansForDate(day);

              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <div
                  className={`calendar-day ${
                    isToday ? "today" : ""
                  }`}
                  key={day}
                >
                  <span className="calendar-date">
                    {day}
                  </span>

                  {dayPlans.map((plan) => (
                    <div
                      className="calendar-workout"
                      key={plan.id}
                      title={`${plan.title} - ${plan.category || "Cardio"}`}
                    >
                      <span className="calendar-workout-title">
                        🏋️ {plan.title}
                      </span>

                      <span className="calendar-workout-category">
                        {plan.category || "Cardio"}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <div className="calendar-legend">
          <span>🟦 Scheduled workout</span>
          <span>🔵 Today's date</span>
        </div>
      </section>

      <div className="calendar-footer">
        <Link to="/workout-planner">
          + Create or Manage Workout Plans
        </Link>
      </div>
    </div>
  );
}
