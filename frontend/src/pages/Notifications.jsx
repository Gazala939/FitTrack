
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications/");
      setNotifications(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Create a notification
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await api.post("/notifications/", {
        title,
        message,
      });

      setTitle("");
      setMessage("");
      setSuccess("Notification created successfully!");

      fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create notification."
      );
    }
  };

  // Mark notification as read
  const handleMarkRead = async (id) => {
    try {
      setError("");
      await api.patch(`/notifications/${id}/read`);

      setSuccess("Notification marked as read!");
      fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to update notification."
      );
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      setError("");
      await api.delete(`/notifications/${id}`);

      setSuccess("Notification deleted successfully!");
      fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to delete notification."
      );
    }
  };

  // Generate daily workout reminder
  const handleDailyReminder = async () => {
    try {
      setError("");
      setSuccess("");

      const response = await api.post("/notifications/daily-reminder");

      setSuccess(response.data.message);
      fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create workout reminder."
      );
    }
  };

  // Generate goal progress alerts
  const handleGoalAlerts = async () => {
    try {
      setError("");
      setSuccess("");

      const response = await api.post("/notifications/goal-alerts");

      setSuccess(
        `${response.data.message} Alerts created: ${response.data.alerts_created}`
      );

      fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to generate goal alerts."
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your fitness activities and goals.</p>
        </div>

        <button onClick={fetchNotifications} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="notification-summary">
        <div className="notification-summary-card">
          <h3>{notifications.length}</h3>
          <p>Total Notifications</p>
        </div>

        <div className="notification-summary-card">
          <h3>{unreadCount}</h3>
          <p>Unread Notifications</p>
        </div>

        <div className="notification-summary-card">
          <h3>{notifications.length - unreadCount}</h3>
          <p>Read Notifications</p>
        </div>
      </div>

      {error && <div className="notification-error">{error}</div>}
      {success && <div className="notification-success">{success}</div>}

      <div className="notification-actions">
        <button onClick={handleDailyReminder}>
          Create Daily Workout Reminder
        </button>

        <button onClick={handleGoalAlerts}>
          Generate Goal Alerts
        </button>
      </div>

      <div className="create-notification">
        <h2>Create Notification</h2>

        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={2}
            maxLength={150}
            required
          />

          <textarea
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            minLength={2}
            maxLength={500}
            required
          />

          <button type="submit">Create Notification</button>
        </form>
      </div>

      <div className="notification-list">
        <h2>All Notifications</h2>

        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="empty-notifications">
            No notifications available.
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.is_read ? "read" : "unread"
              }`}
            >
              <div className="notification-content">
                <div className="notification-title">
                  <h3>{notification.title}</h3>

                  {!notification.is_read && (
                    <span className="unread-label">New</span>
                  )}
                </div>

                <p>{notification.message}</p>

                <small>
                  {new Date(notification.created_at).toLocaleString()}
                </small>
              </div>

              <div className="notification-buttons">
                {!notification.is_read && (
                  <button
                    className="mark-read-btn"
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}

                <button
                  className="delete-notification-btn"
                  onClick={() => handleDelete(notification.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
