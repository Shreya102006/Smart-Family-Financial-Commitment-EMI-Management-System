import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data || []);
      const countRes = await notificationAPI.getUnreadCount();
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'OVERDUE':
        return <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>;
      case 'DUE_TODAY':
        return <i className="bi bi-clock-fill text-warning fs-5"></i>;
      case 'PAYMENT_SUCCESS':
        return <i className="bi bi-check-circle-fill text-success fs-5"></i>;
      default:
        return <i className="bi bi-bell-fill text-primary fs-5"></i>;
    }
  };

  return (
    <div className="position-relative">
      <button
        className="btn btn-light rounded-circle position-relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{ width: '42px', height: '42px' }}
      >
        <i className="bi bi-bell fs-5 text-secondary"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1040 }}
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {isOpen && (
        <div
          className="card shadow-lg border-0 position-absolute end-0 mt-2 rounded-3"
          style={{ width: '360px', zIndex: 1050, maxHeight: '480px', display: 'flex', flexDirection: 'column' }}
        >
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-bold mb-0 text-dark">Notifications</h6>
              {unreadCount > 0 && (
                <span className="badge bg-danger rounded-pill">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link text-decoration-none p-0 small text-primary fw-medium"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="card-body p-0 overflow-auto" style={{ maxHeight: '360px' }}>
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">
                <i className="bi bi-bell-slash fs-4 d-block mb-1"></i>
                No notifications right now
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className={`list-group-item list-group-item-action d-flex align-items-start gap-3 p-3 border-bottom ${
                      !item.isRead ? 'bg-light' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(item.notificationType)}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <p className={`small mb-1 ${!item.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}>
                        {item.message}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.dueDate ? `Due: ${formatDate(item.dueDate)}` : formatDate(item.createdAt)}
                        </span>
                        {!item.isRead && (
                          <button
                            className="btn btn-sm btn-link text-muted p-0"
                            style={{ fontSize: '0.75rem' }}
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-footer bg-white text-center py-2 border-top">
            <Link
              to="/notifications"
              className="small fw-semibold text-primary text-decoration-none"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
