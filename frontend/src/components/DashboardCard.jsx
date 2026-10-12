import React from 'react';

const DashboardCard = ({ title, value, icon, iconBg = 'bg-primary', iconColor = 'text-white', subtitle, note }) => {
  return (
    <div className="stat-card">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-muted small fw-medium text-uppercase">{title}</span>
        <div className={`stat-icon ${iconBg} ${iconColor}`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      <div className="d-flex align-items-baseline">
        <h3 className="fw-bold mb-0 text-dark">{value}</h3>
      </div>
      {(subtitle || note) && (
        <div className="mt-2 pt-2 border-top small text-muted d-flex justify-content-between align-items-center">
          <span>{subtitle}</span>
          {note && <span className="fw-medium">{note}</span>}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
