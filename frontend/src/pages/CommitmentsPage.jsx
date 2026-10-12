import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commitmentAPI } from '../services/api';
import CommitmentCard from '../components/CommitmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';

const CommitmentsPage = () => {
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCommitments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await commitmentAPI.getCommitments({
        status: statusFilter || undefined,
        type: typeFilter || undefined
      });
      setCommitments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load commitments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommitments();
  }, [statusFilter, typeFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await commitmentAPI.deleteCommitment(deleteTarget.id);
      setDeleteTarget(null);
      await fetchCommitments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete commitment');
    }
  };

  const filteredCommitments = commitments.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.type?.toLowerCase().includes(q) ||
      c.familyMemberName?.toLowerCase().includes(q)
    );
  });

  const commitmentTypes = [
    'Home Loan EMI',
    'Car Loan EMI',
    'Personal Loan EMI',
    'Education Fee',
    'Insurance Premium',
    'Rent',
    'Utility Bill',
    'Credit Card Installment',
    'Other Recurring Payment'
  ];

  if (loading && commitments.length === 0) {
    return <LoadingSpinner message="Loading financial commitments..." />;
  }

  return (
    <div className="container-fluid p-0">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Financial Commitments & EMIs</h2>
          <p className="text-muted small mb-0">Track all ongoing household loans, premiums, fees, and utility bills</p>
        </div>
        <div>
          <Link to="/commitments/add" className="btn btn-primary d-flex align-items-center gap-2 px-3 shadow-sm">
            <i className="bi bi-plus-circle"></i>
            <span>Add New Commitment</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCommitments} />}

      {/* Filters bar */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by title or family member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-4">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Commitment Types</option>
                {commitmentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-4">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Commitments Grid */}
      {filteredCommitments.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border">
          <i className="bi bi-wallet2 text-muted display-4 d-block mb-3"></i>
          <h5 className="fw-bold text-dark">No commitments found</h5>
          <p className="text-muted small mb-3">
            {searchQuery || typeFilter || statusFilter
              ? 'Try adjusting your filters or search terms.'
              : 'Add your home loan, car loan, insurance, or other EMI to start tracking.'}
          </p>
          <Link to="/commitments/add" className="btn btn-primary btn-sm">
            <i className="bi bi-plus-circle me-1"></i> Add First Commitment
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredCommitments.map((commitment) => (
            <div key={commitment.id} className="col-12 col-md-6 col-xl-4">
              <CommitmentCard
                commitment={commitment}
                onDelete={(c) => setDeleteTarget(c)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Commitment"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All scheduled payments and payment history for this commitment will also be removed.`}
        confirmText="Delete Commitment"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CommitmentsPage;
