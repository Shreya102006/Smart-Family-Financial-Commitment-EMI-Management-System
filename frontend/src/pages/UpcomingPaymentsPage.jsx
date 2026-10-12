import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import PaymentTable from '../components/PaymentTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency } from '../utils/formatters';

const UpcomingPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentAPI.getUpcoming();
      setPayments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load upcoming payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const handlePaymentSuccess = async (paymentId, payload) => {
    await paymentAPI.markAsPaid(paymentId, payload);
    await fetchUpcoming();
  };

  if (loading) return <LoadingSpinner message="Fetching upcoming family payments..." />;

  const totalUpcomingAmount = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Upcoming Payments</h2>
          <p className="text-muted small mb-0">Payments sorted chronologically by nearest due date</p>
        </div>
        <div className="bg-white border rounded-3 p-3 shadow-sm d-flex align-items-center gap-3">
          <div className="bg-warning-subtle text-warning p-2 rounded-2">
            <i className="bi bi-clock-history fs-4"></i>
          </div>
          <div>
            <span className="text-muted small d-block">Total Upcoming Outflow</span>
            <span className="fw-bold text-dark fs-5">{formatCurrency(totalUpcomingAmount)}</span>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchUpcoming} />}

      {/* Visual Legend */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-body p-3 d-flex flex-wrap align-items-center gap-3 small">
          <span className="fw-semibold text-secondary">Status Indicators:</span>
          <span className="badge badge-status-paid">Green = Paid</span>
          <span className="badge badge-status-upcoming">Yellow = Upcoming</span>
          <span className="badge badge-status-pending">Orange = Due Today / Pending</span>
          <span className="badge badge-status-overdue">Red = Overdue</span>
        </div>
      </div>

      <div className="card custom-card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark">
            <i className="bi bi-calendar-event me-2 text-primary"></i>
            Upcoming Installments Queue ({payments.length})
          </span>
        </div>
        <div className="card-body p-0">
          <PaymentTable
            payments={payments}
            onPaymentSuccess={handlePaymentSuccess}
            showCommitmentDetails={true}
          />
        </div>
      </div>
    </div>
  );
};

export default UpcomingPaymentsPage;
