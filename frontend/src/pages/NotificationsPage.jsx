import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/formatters';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationAPI.getNotifications(unreadOnly);
      setNotifications(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'OVERDUE':
        return <i className="bi bi-exclamation-octagon-fill text-danger fs-4"></i>;
      case 'DUE_TODAY':
        return <i className="bi bi-clock-fill text-warning fs-4"></i>;
      case 'PAYMENT_SUCCESS':
        return <i className="bi bi-check-circle-fill text-success fs-4"></i>;
      default:
        return <i className="bi bi-bell-fill text-primary fs-4"></i>;
    }
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case 'OVERDUE':
        return 'badge bg-danger';
      case 'DUE_TODAY':
        return 'badge bg-warning text-dark';
      case 'PAYMENT_SUCCESS':
        return 'badge bg-success';
      default:
        return 'badge bg-primary';
    }
  };

  if (loading && notifications.length === 0) return <LoadingSpinner message="Loading notifications..." />;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Reminder Alerts & Notifications</h2>
          <p className="text-muted small mb-0">Upcoming due dates, payment reminders, and overdue alerts</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${!unreadOnly ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setUnreadOnly(false)}
          >
            All
          </button>
          <button
            className={`btn btn-sm ${unreadOnly ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setUnreadOnly(true)}
          >
            Unread Only {unreadCount > 0 && `(${unreadCount})`}
          </button>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-outline-secondary ms-2" onClick={handleMarkAllAsRead}>
              <i className="bi bi-check-all me-1"></i> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchNotifications} />}

      <div className="card custom-card border-0 shadow-sm">
        <div className="card-body p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-bell-slash text-muted display-5 d-block mb-2"></i>
              <h6 className="fw-bold text-dark">No notifications</h6>
              <p className="text-muted small mb-0">You're all caught up with your family commitments.</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`list-group-item d-flex align-items-start gap-3 p-4 border-bottom ${
                    !item.isRead ? 'bg-light' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">{getIcon(item.notificationType)}</div>
                  <div className="flex-grow-1 min-width-0">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={getBadgeClass(item.notificationType)}>
                        {item.notificationType?.replace('_', ' ')}
                      </span>
                      {item.commitmentTitle && (
                        <span className="fw-semibold text-dark small">{item.commitmentTitle}</span>
                      )}
                    </div>
                    <p className={`mb-1 ${!item.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}>
                      {item.message}
                    </p>
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      <span>
                        <i className="bi bi-clock me-1"></i>
                        {item.dueDate ? `Due Date: ${formatDate(item.dueDate)}` : formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!item.isRead && (
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 flex-shrink-0"
                      onClick={() => handleMarkAsRead(item.id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
