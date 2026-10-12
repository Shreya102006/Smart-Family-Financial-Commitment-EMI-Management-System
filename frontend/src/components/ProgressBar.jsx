import React from 'react';

const ProgressBar = ({ percentage = 0, height = '8px', showLabel = false, labelPrefix = '' }) => {
  const cleanPercentage = Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));

  let variant = 'bg-primary';
  if (cleanPercentage >= 100) variant = 'bg-success';
  else if (cleanPercentage >= 75) variant = 'bg-info';
  else if (cleanPercentage >= 35) variant = 'bg-primary';
  else variant = 'bg-warning';

  return (
    <div className="w-100">
      {showLabel && (
        <div className="d-flex justify-content-between align-items-center mb-1 small text-muted">
          <span>{labelPrefix || 'Repayment Progress'}</span>
          <span className="fw-semibold text-dark">{cleanPercentage}%</span>
        </div>
      )}
      <div className="progress" style={{ height, borderRadius: '9999px', backgroundColor: '#e2e8f0' }}>
        <div
          className={`progress-bar ${variant}`}
          role="progressbar"
          style={{ width: `${cleanPercentage}%`, borderRadius: '9999px', transition: 'width 0.4s ease' }}
          aria-valuenow={cleanPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
