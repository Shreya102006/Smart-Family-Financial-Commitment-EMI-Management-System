import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentAPI.getHistory();
      setPayments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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

  // Filtering
  const filteredPayments = payments.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.commitmentTitle?.toLowerCase().includes(q) ||
        p.familyMemberName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (typeFilter && p.commitmentType !== typeFilter) return false;
    if (statusFilter && p.paymentStatus !== statusFilter) return false;

    const paymentDateStr = p.paidDate || p.dueDate;
    if (dateFrom && paymentDateStr < dateFrom) return false;
    if (dateTo && paymentDateStr > dateTo) return false;

    return true;
  });

  // Sorting
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const dateA = a.paidDate || a.dueDate;
    const dateB = b.paidDate || b.dueDate;

    if (sortBy === 'date-desc') return dateB.localeCompare(dateA);
    if (sortBy === 'date-asc') return dateA.localeCompare(dateB);
    if (sortBy === 'amount-desc') return (b.paidAmount || b.amount) - (a.paidAmount || a.amount);
    if (sortBy === 'amount-asc') return (a.paidAmount || a.amount) - (b.paidAmount || b.amount);
    return 0;
  });

  if (loading && payments.length === 0) return <LoadingSpinner message="Loading historical records..." />;

  const totalFilteredPaid = sortedPayments
    .filter((p) => p.paymentStatus === 'PAID')
    .reduce((sum, p) => sum + (parseFloat(p.paidAmount) || parseFloat(p.amount) || 0), 0);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Payment History & Records</h2>
          <p className="text-muted small mb-0">Search and audit all completed and past installments</p>
        </div>
        <div className="bg-white border rounded-3 p-3 shadow-sm d-flex align-items-center gap-3">
          <div className="bg-success-subtle text-success p-2 rounded-2">
            <i className="bi bi-wallet2 fs-4"></i>
          </div>
          <div>
            <span className="text-muted small d-block">Filtered Settled Outflow</span>
            <span className="fw-bold text-dark fs-5">{formatCurrency(totalFilteredPaid)}</span>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchHistory} />}

      {/* Filter and Search Box */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted mb-1">Search</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Commitment or member name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small text-muted mb-1">Type</label>
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {commitmentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small text-muted mb-1">Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small text-muted mb-1">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small text-muted mb-1">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-1">
              <label className="form-label small text-muted mb-1">Sort</label>
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Newest</option>
                <option value="date-asc">Oldest</option>
                <option value="amount-desc">High ₹</option>
                <option value="amount-asc">Low ₹</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card custom-card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark">
            <i className="bi bi-receipt me-2 text-primary"></i>
            Transactions & Schedule Records ({sortedPayments.length})
          </span>
        </div>
        <div className="card-body p-0">
          {sortedPayments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-folder2-open text-muted display-5 d-block mb-2"></i>
              <p className="text-muted mb-0">No records match the selected filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-custom table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Payment Date</th>
                    <th>Commitment</th>
                    <th>Member</th>
                    <th>Installment Amount</th>
                    <th>Settled Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="fw-semibold text-dark">
                          {p.paidDate ? formatDate(p.paidDate) : '-'}
                        </span>
                      </td>
                      <td>
                        <div className="fw-medium text-dark">{p.commitmentTitle}</div>
                        <small className="text-muted">{p.commitmentType}</small>
                      </td>
                      <td>
                        <span className="text-secondary small">
                          <i className="bi bi-person me-1"></i>
                          {p.familyMemberName || 'Family'}
                        </span>
                      </td>
                      <td>
                        <span className="text-dark fw-semibold">{formatCurrency(p.amount)}</span>
                      </td>
                      <td>
                        {p.paymentStatus === 'PAID' ? (
                          <span className="text-success fw-bold">{formatCurrency(p.paidAmount || p.amount)}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className="text-muted small">{formatDate(p.dueDate)}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(p.paymentStatus)}`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
