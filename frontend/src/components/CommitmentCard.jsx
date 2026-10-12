import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';
import ProgressBar from './ProgressBar';

const CommitmentCard = ({ commitment, onDelete }) => {
  return (
    <div className="card custom-card h-100 shadow-sm border-0">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <span className="badge bg-light text-primary border mb-1 small fw-semibold">
              {commitment.type}
            </span>
            <h5 className="fw-bold text-dark mb-1">{commitment.title}</h5>
            {commitment.familyMemberName && (
              <p className="text-muted small mb-0">
                <i className="bi bi-person me-1"></i> {commitment.familyMemberName}
              </p>
            )}
          </div>
          <span className={`badge ${getStatusBadgeClass(commitment.status)}`}>
            {commitment.status}
          </span>
        </div>

        <div className="my-3 py-2 border-top border-bottom">
          <div className="row g-2 text-center">
            <div className="col-4">
              <span className="text-muted small d-block">Installment</span>
              <span className="fw-bold text-dark small">{formatCurrency(commitment.amount)}</span>
              <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>/{commitment.frequency}</span>
            </div>
            <div className="col-4 border-start border-end">
              <span className="text-muted small d-block">Total</span>
              <span className="fw-bold text-dark small">{formatCurrency(commitment.totalAmount)}</span>
            </div>
            <div className="col-4">
              <span className="text-muted small d-block">Remaining</span>
              <span className="fw-bold text-danger small">{formatCurrency(commitment.remainingAmount)}</span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <ProgressBar
            percentage={commitment.progressPercentage}
            showLabel={true}
            labelPrefix="Repaid"
          />
        </div>

        <div className="d-flex justify-content-between text-muted small mb-4">
          <span>
            <i className="bi bi-calendar3 me-1"></i> Start: {formatDate(commitment.startDate)}
          </span>
          <span>
            Due Day: <strong>{commitment.dueDateDay || '-'}th</strong>
          </span>
        </div>

        <div className="mt-auto pt-2 d-flex gap-2">
          <Link to={`/commitments/${commitment.id}`} className="btn btn-sm btn-outline-primary flex-grow-1">
            <i className="bi bi-eye me-1"></i> View Schedule
          </Link>
          <Link to={`/commitments/edit/${commitment.id}`} className="btn btn-sm btn-light border text-secondary" title="Edit">
            <i className="bi bi-pencil"></i>
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(commitment)}
              className="btn btn-sm btn-light border text-danger"
              title="Delete"
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitmentCard;
