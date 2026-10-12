import React, { useState, useEffect } from 'react';
import { reportAPI, familyMemberAPI } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency } from '../utils/formatters';

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');

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

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rRes, mRes] = await Promise.all([
        reportAPI.getSummary({
          year: yearFilter || undefined,
          month: monthFilter || undefined,
          commitmentType: typeFilter || undefined,
          memberId: memberFilter || undefined
        }),
        familyMemberAPI.getMembers()
      ]);
      setReport(rRes.data);
      setMembers(mRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [yearFilter, monthFilter, typeFilter, memberFilter]);

  if (loading && !report) return <LoadingSpinner message="Generating comprehensive family financial reports..." />;

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' }
  ];

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Financial Analysis & Reports</h2>
          <p className="text-muted small mb-0">Detailed breakdown by member, loan category, and historical outflow</p>
        </div>
        <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => window.print()}>
          <i className="bi bi-printer"></i>
          <span>Print / Export PDF</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchReports} />}

      {/* Filter Toolbar */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">Year</label>
              <select
                className="form-select form-select-sm"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">Month</label>
              <select
                className="form-select form-select-sm"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map((m) => (
                  <option key={m.num} value={m.num}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">Commitment Type</label>
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

            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">Family Member</label>
              <select
                className="form-select form-select-sm"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              >
                <option value="">All Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card custom-card border-0 shadow-sm p-3">
            <span className="text-muted small fw-medium text-uppercase">Total Commitments</span>
            <h4 className="fw-bold text-dark mt-1 mb-0">{formatCurrency(report?.totalCommitmentsAmount)}</h4>
            <span className="small text-muted">{report?.totalCommitmentCount || 0} Commitments</span>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card custom-card border-0 shadow-sm p-3">
            <span className="text-muted small fw-medium text-uppercase">Monthly Outflow</span>
            <h4 className="fw-bold text-primary mt-1 mb-0">{formatCurrency(report?.monthlyCommitmentsAmount)}</h4>
            <span className="small text-muted">Recurring Monthly Average</span>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card custom-card border-0 shadow-sm p-3">
            <span className="text-muted small fw-medium text-uppercase">Total Settled</span>
            <h4 className="fw-bold text-success mt-1 mb-0">{formatCurrency(report?.totalPaidAmount)}</h4>
            <span className="small text-muted">Paid Principal & Interest</span>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card custom-card border-0 shadow-sm p-3">
            <span className="text-muted small fw-medium text-uppercase">Total Overdue</span>
            <h4 className="fw-bold text-danger mt-1 mb-0">{formatCurrency(report?.totalOverdueAmount)}</h4>
            <span className="small text-danger fw-semibold">{report?.overduePaymentsCount || 0} Overdue Installments</span>
          </div>
        </div>
      </div>

      {/* Member-Wise Commitments Report */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-people-fill me-2 text-primary"></i>
            Family Member-Wise Commitment Analysis
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-custom table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Family Member</th>
                  <th>Relationship</th>
                  <th>Active Obligations</th>
                  <th>Total Committed</th>
                  <th>Total Paid</th>
                  <th>Remaining Balance</th>
                  <th style={{ width: '25%' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {report?.memberReports?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">No member obligations found.</td>
                  </tr>
                ) : (
                  report?.memberReports?.map((m) => (
                    <tr key={m.memberId}>
                      <td className="fw-bold text-dark">{m.memberName}</td>
                      <td>
                        <span className="badge bg-light text-secondary border small">
                          {m.relationship}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          {m.commitmentCount} Items
                        </span>
                      </td>
                      <td className="fw-semibold text-dark">{formatCurrency(m.totalAmount)}</td>
                      <td className="fw-semibold text-success">{formatCurrency(m.paidAmount)}</td>
                      <td className="fw-semibold text-danger">{formatCurrency(m.remainingAmount)}</td>
                      <td>
                        <ProgressBar percentage={m.progressPercentage} showLabel={true} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category / Type Distribution Report */}
      <div className="card custom-card border-0 shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
            Commitment Category Distribution
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-custom table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Category / Type</th>
                  <th>Count</th>
                  <th>Total Obligation</th>
                  <th>Paid Amount</th>
                  <th>Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {report?.typeDistribution?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No categories recorded.</td>
                  </tr>
                ) : (
                  report?.typeDistribution?.map((t) => (
                    <tr key={t.type}>
                      <td className="fw-semibold text-dark">{t.type}</td>
                      <td>{t.count}</td>
                      <td className="fw-semibold text-dark">{formatCurrency(t.totalAmount)}</td>
                      <td className="fw-semibold text-success">{formatCurrency(t.paidAmount)}</td>
                      <td className="fw-semibold text-danger">{formatCurrency(t.remainingAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
