import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationPanel from './NotificationPanel';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-light d-lg-none p-2 border"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-people-fill me-1"></i> {user?.familyName || 'Family Financial Hub'}
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <NotificationPanel />

        <div className="dropdown">
          <button
            className="btn btn-light border d-flex align-items-center gap-2 py-1 px-2 rounded-pill"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="d-none d-md-inline small fw-semibold text-dark pe-1">
              {user?.fullName || 'User'}
            </span>
            <i className="bi bi-chevron-down small text-muted"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2">
            <li className="px-3 py-2 border-bottom">
              <span className="d-block small text-muted">Signed in as</span>
              <strong className="d-block text-dark small text-truncate" style={{ maxWidth: '180px' }}>
                {user?.email}
              </strong>
            </li>
            <li>
              <Link className="dropdown-item py-2 small" to="/profile">
                <i className="bi bi-person me-2 text-primary"></i> Profile & Security
              </Link>
            </li>
            <li>
              <Link className="dropdown-item py-2 small" to="/family">
                <i className="bi bi-people me-2 text-primary"></i> Family Settings
              </Link>
            </li>
            <li><hr className="dropdown-divider my-1" /></li>
            <li>
              <button className="dropdown-item py-2 small text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
