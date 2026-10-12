import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { dashboardAPI, paymentAPI } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import PaymentTable from '../components/PaymentTable';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency } from '../utils/formatters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardAPI.getSummary();
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePaymentSuccess = async (paymentId, payload) => {
    await paymentAPI.markAsPaid(paymentId, payload);
    await fetchDashboardData();
  };

  if (loading) {
    return <LoadingSpinner message="Calculating family financial metrics & schedules..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  // Prepare Bar Chart: Monthly commitments vs paid
  const monthlyData = summary?.monthlyTrends || [];
  const barChartData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      {
        label: 'Committed (₹)',
        data: monthlyData.map((m) => m.committedAmount),
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Paid (₹)',
        data: monthlyData.map((m) => m.paidAmount),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Prepare Doughnut Chart: Paid vs Remaining
  const doughnutPaidVsRemaining = {
    labels: ['Total Paid', 'Total Remaining'],
    datasets: [
      {
        data: [
          summary?.totalPaidAmount || 0,
          summary?.totalRemainingAmount || 0
        ],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Prepare Doughnut Chart: Commitment Types
  const typeMap = summary?.commitmentTypeDistribution || {};
  const typeLabels = Object.keys(typeMap);
  const typeValues = Object.values(typeMap);
  const typeChartColors = [
    '#2563eb', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899', '#64748b'
  ];

  const doughnutTypeDistribution = {
    labels: typeLabels.length > 0 ? typeLabels : ['No Data'],
    datasets: [
      {
        data: typeValues.length > 0 ? typeValues : [1],
        backgroundColor: typeLabels.length > 0 ? typeChartColors.slice(0, typeLabels.length) : ['#e2e8f0'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <div className="container-fluid p-0">
      {/* Top Header & Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Financial Dashboard</h2>
          <p className="text-muted small mb-0">Overview of all household commitments, EMIs, and upcoming payments</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/commitments/add" className="btn btn-primary d-flex align-items-center gap-2 px-3 shadow-sm">
            <i className="bi bi-plus-circle"></i>
            <span>Add Commitment</span>
          </Link>
          <Link to="/family" className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3">
            <i className="bi bi-people"></i>
            <span>Family Members</span>
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {summary?.overduePaymentsCount > 0 && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 shadow-sm mb-4">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-exclamation-octagon-fill fs-3 text-danger"></i>
            <div>
              <h6 className="fw-bold mb-0 text-danger">Action Required: {summary.overduePaymentsCount} Overdue Payment(s)</h6>
              <p className="small mb-0 text-muted">
                You have overdue installments that need immediate settlement.
              </p>
            </div>
          </div>
          <Link to="/payments?status=OVERDUE" className="btn btn-sm btn-danger px-3">
            Review Overdue
          </Link>
        </div>
      )}

      {/* 7 Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Total Monthly Commitments"
            value={formatCurrency(summary?.totalMonthlyCommitments)}
            icon="bi-cash-coin"
            iconBg="bg-primary-subtle"
            iconColor="text-primary"
            subtitle="Recurring EMI / Month"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Active Commitments"
            value={summary?.totalActiveCommitments || 0}
            icon="bi-layers-fill"
            iconBg="bg-info-subtle"
            iconColor="text-info"
            subtitle="Ongoing Loans & Fees"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Upcoming Payments"
            value={summary?.upcomingPaymentsCount || 0}
            icon="bi-hourglass-split"
            iconBg="bg-warning-subtle"
            iconColor="text-warning"
            subtitle="Scheduled in Queue"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Overdue Payments"
            value={summary?.overduePaymentsCount || 0}
            icon="bi-exclamation-triangle-fill"
            iconBg="bg-danger-subtle"
            iconColor="text-danger"
            subtitle="Immediate Attention"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <DashboardCard
            title="Total Paid Amount"
            value={formatCurrency(summary?.totalPaidAmount)}
            icon="bi-check2-circle"
            iconBg="bg-success-subtle"
            iconColor="text-success"
            subtitle="Total Settled So Far"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <DashboardCard
            title="Total Remaining Balance"
            value={formatCurrency(summary?.totalRemainingAmount)}
            icon="bi-wallet"
            iconBg="bg-warning-subtle"
            iconColor="text-warning"
            subtitle="Outstanding Liability"
          />
        </div>
        <div className="col-12 col-sm-12 col-xl-4">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-medium text-uppercase">Overall Repayment</span>
              <span className="fw-bold text-dark fs-5">{summary?.overallProgressPercentage || 0}%</span>
            </div>
            <div className="my-2">
              <ProgressBar percentage={summary?.overallProgressPercentage || 0} height="12px" />
            </div>
            <div className="d-flex justify-content-between small text-muted mt-2 border-top pt-2">
              <span>Paid: {formatCurrency(summary?.totalPaidAmount)}</span>
              <span>Total: {formatCurrency(summary?.totalCommitmentAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card custom-card h-100 shadow-sm border-0">
            <div className="card-header d-flex justify-content-between align-items-center bg-white">
              <span className="fw-bold text-dark">
                <i className="bi bi-bar-chart-line me-2 text-primary"></i>
                Monthly Financial Commitment Trends
              </span>
              <span className="text-muted small">Past & Upcoming Months</span>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (val) => formatCurrency(val)
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card custom-card h-100 shadow-sm border-0">
            <div className="card-header bg-white">
              <span className="fw-bold text-dark">
                <i className="bi bi-pie-chart me-2 text-primary"></i>
                Commitment Distribution
              </span>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <div style={{ height: '240px', width: '100%' }}>
                <Doughnut
                  data={doughnutTypeDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.label}: ${formatCurrency(context.raw)}`
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Payments Table Preview */}
      <div className="card custom-card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark">
            <i className="bi bi-calendar2-event me-2 text-primary"></i>
            Upcoming Payments (Next Due)
          </span>
          <Link to="/payments/upcoming" className="btn btn-sm btn-outline-primary">
            View All Upcoming <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="card-body p-0">
          <PaymentTable
            payments={summary?.upcomingPayments || []}
            onPaymentSuccess={handlePaymentSuccess}
            showCommitmentDetails={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
