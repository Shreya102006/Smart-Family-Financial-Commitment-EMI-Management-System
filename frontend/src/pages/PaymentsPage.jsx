import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentAPI, familyMemberAPI } from '../services/api';
import PaymentTable from '../components/PaymentTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PaymentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [memberFilter, setMemberFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pRes, mRes] = await Promise.all([
        paymentAPI.getPayments({
          status: statusFilter || undefined,
          memberId: memberFilter || undefined
        }),
        familyMemberAPI.getMembers()
      ]);
      setPayments(pRes.data || []);
      setMembers(mRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, memberFilter]);

  const handlePaymentSuccess = async (paymentId, payload) => {
    await paymentAPI.markAsPaid(paymentId, payload);
    await fetchData();
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.commitmentTitle?.toLowerCase().includes(q) ||
      p.familyMemberName?.toLowerCase().includes(q) ||
      p.commitmentType?.toLowerCase().includes(q)
    );
  });

  if (loading && payments.length === 0) return <LoadingSpinner message="Loading all scheduled payments..." />;

  const upcomingCount = payments.filter((p) => p.paymentStatus === 'UPCOMING').length;
  const pendingCount = payments.filter((p) => p.paymentStatus === 'PENDING').length;
  const overdueCount = payments.filter((p) => p.paymentStatus === 'OVERDUE').length;
  const paidCount = payments.filter((p) => p.paymentStatus === 'PAID').length;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Payment Schedule & Management</h2>
          <p className="text-muted small mb-0">Master schedule of all installments across all loans and commitments</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Quick Summary Pill Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-light border'} px-3 rounded-pill`}
          onClick={() => { setStatusFilter(''); setSearchParams({}); }}
        >
          All ({payments.length})
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'UPCOMING' ? 'btn-warning text-dark fw-bold' : 'btn-light border'} px-3 rounded-pill`}
          onClick={() => { setStatusFilter('UPCOMING'); setSearchParams({ status: 'UPCOMING' }); }}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-warning text-dark fw-bold' : 'btn-light border'} px-3 rounded-pill`}
          onClick={() => { setStatusFilter('PENDING'); setSearchParams({ status: 'PENDING' }); }}
        >
          Due Today / Pending ({pendingCount})
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'OVERDUE' ? 'btn-danger' : 'btn-light border'} px-3 rounded-pill`}
          onClick={() => { setStatusFilter('OVERDUE'); setSearchParams({ status: 'OVERDUE' }); }}
        >
          Overdue ({overdueCount})
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'PAID' ? 'btn-success' : 'btn-light border'} px-3 rounded-pill`}
          onClick={() => { setStatusFilter('PAID'); setSearchParams({ status: 'PAID' }); }}
        >
          Paid ({paidCount})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Filter by commitment name or family member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <select
                className="form-select form-select-sm"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              >
                <option value="">All Family Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="card custom-card border-0 shadow-sm">
        <div className="card-body p-0">
          <PaymentTable
            payments={filteredPayments}
            onPaymentSuccess={handlePaymentSuccess}
            showCommitmentDetails={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
