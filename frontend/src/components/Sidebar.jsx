import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'bi-grid-1x2-fill' },
    { name: 'Family Members', path: '/family', icon: 'bi-people-fill' },
    { name: 'Commitments', path: '/commitments', icon: 'bi-wallet2' },
    { name: 'Payment Schedule', path: '/payments', icon: 'bi-calendar-check' },
    { name: 'Upcoming Payments', path: '/payments/upcoming', icon: 'bi-clock-history' },
    { name: 'Payment History', path: '/payments/history', icon: 'bi-receipt' },
    { name: 'Notifications', path: '/notifications', icon: 'bi-bell-fill' },
    { name: 'Reports', path: '/reports', icon: 'bi-bar-chart-fill' },
    { name: 'Profile', path: '/profile', icon: 'bi-person-circle' }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="modal-backdrop fade show d-lg-none"
          onClick={onClose}
          style={{ zIndex: 999 }}
        ></div>
      )}

      <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
              <i className="bi bi-shield-check fs-5"></i>
            </div>
            <div>
              <div className="fw-bold text-white fs-6 lh-1">SmartFamily</div>
              <small className="text-muted" style={{ fontSize: '0.725rem' }}>Financial Hub</small>
            </div>
          </div>
          <button className="btn btn-sm btn-link text-white d-lg-none p-0" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="text-uppercase text-muted px-3 mb-2 fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            Main Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/payments'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white border-secondary"
            style={{ fontSize: '0.875rem' }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
