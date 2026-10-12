import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { commitmentAPI, paymentAPI } from '../services/api';
import PaymentTable from '../components/PaymentTable';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';

const CommitmentDetailsPage = () => {
  const { id } = useParams();
  const [commitment, setCommitment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cRes, pRes] = await Promise.all([
        commitmentAPI.getCommitmentById(id),
        paymentAPI.getPayments({ commitmentId: id })
      ]);
      setCommitment(cRes.data);
      setPayments(pRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load commitment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePaymentSuccess = async (paymentId, payload) => {
    await paymentAPI.markAsPaid(paymentId, payload);
    await fetchData();
  };

  if (loading) return <LoadingSpinner message="Loading commitment and schedule..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!commitment) return null;

  const paidCount = payments.filter((p) => p.paymentStatus === 'PAID').length;
  const overdueCount = payments.filter((p) => p.paymentStatus === 'OVERDUE').length;
  const upcomingCount = payments.filter((p) => p.paymentStatus === 'UPCOMING' || p.paymentStatus === 'PENDING').length;

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link to="/commitments" className="btn btn-sm btn-light border">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold text-dark mb-0">{commitment.title}</h2>
              <span className={`badge ${getStatusBadgeClass(commitment.status)}`}>
                {commitment.status}
              </span>
            </div>
            <p className="text-muted small mb-0">
              {commitment.type} &bull; {commitment.frequency} Installments &bull; Member: {commitment.familyMemberName || 'Family Shared'}
            </p>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to={`/commitments/edit/${commitment.id}`} className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i className="bi bi-pencil"></i>
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card custom-card border-0 shadow-sm p-4">
            <span className="text-muted small fw-medium text-uppercase">Installment Amount</span>
            <h3 className="fw-bold text-dark mt-1 mb-1">{formatCurrency(commitment.amount)}</h3>
            <span className="text-muted small">Every {commitment.frequency} ({commitment.dueDateDay}th of month)</span>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card custom-card border-0 shadow-sm p-4">
            <span className="text-muted small fw-medium text-uppercase">Total Commitment</span>
            <h3 className="fw-bold text-dark mt-1 mb-1">{formatCurrency(commitment.totalAmount)}</h3>
            <span className="text-success small fw-medium">Paid: {formatCurrency(commitment.paidAmount)}</span>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card custom-card border-0 shadow-sm p-4">
            <span className="text-muted small fw-medium text-uppercase">Remaining Balance</span>
            <h3 className="fw-bold text-danger mt-1 mb-1">{formatCurrency(commitment.remainingAmount)}</h3>
            <span className="text-muted small">
              {commitment.interestRate ? `${commitment.interestRate}% Interest Rate` : 'Zero Interest / Direct Fee'}
            </span>
          </div>
        </div>
      </div>

      {/* Repayment Progress & Schedule Stats */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold text-dark mb-0">Repayment Progress</h6>
            <span className="fw-bold text-primary">{commitment.progressPercentage}% Completed</span>
          </div>
          <ProgressBar percentage={commitment.progressPercentage} height="12px" />

          <div className="row g-2 mt-3 pt-3 border-top text-center">
            <div className="col-3">
              <span className="text-muted small d-block">Total Schedule</span>
              <span className="fw-bold text-dark">{payments.length} Payments</span>
            </div>
            <div className="col-3 border-start">
              <span className="text-muted small d-block">Paid</span>
              <span className="fw-bold text-success">{paidCount} Done</span>
            </div>
            <div className="col-3 border-start">
              <span className="text-muted small d-block">Upcoming</span>
              <span className="fw-bold text-warning">{upcomingCount} Pending</span>
            </div>
            <div className="col-3 border-start">
              <span className="text-muted small d-block">Overdue</span>
              <span className="fw-bold text-danger">{overdueCount} Overdue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Notes if available */}
      {commitment.description && (
        <div className="card custom-card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <h6 className="fw-bold text-dark mb-1 small">Commitment Notes & Account Info</h6>
            <p className="text-muted small mb-0">{commitment.description}</p>
          </div>
        </div>
      )}

      {/* Generated Schedule Table */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark">
            <i className="bi bi-calendar-check me-2 text-primary"></i>
            Generated Payment Schedule & Tracking
          </span>
          <span className="badge bg-light text-secondary border">
            {payments.length} Installments
          </span>
        </div>
        <div className="card-body p-0">
          <PaymentTable
            payments={payments}
            onPaymentSuccess={handlePaymentSuccess}
            showCommitmentDetails={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CommitmentDetailsPage;
