import React, { useState } from 'react';
import { formatCurrency, formatDate, getDaysRemainingLabel, getStatusBadgeClass } from '../utils/formatters';

const PaymentTable = ({ payments = [], onPaymentSuccess, showCommitmentDetails = true }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const openPayModal = (payment) => {
    setSelectedPayment(payment);
    setPaidAmount(payment.remainingAmount || payment.amount);
    setPaidDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setModalError(null);
  };

  const closePayModal = () => {
    setSelectedPayment(null);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      setIsSubmitting(true);
      setModalError(null);
      if (onPaymentSuccess) {
        await onPaymentSuccess(selectedPayment.id, {
          paidAmount: parseFloat(paidAmount),
          paidDate,
          notes
        });
      }
      closePayModal();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-3 border">
        <i className="bi bi-inbox text-muted display-6 d-block mb-2"></i>
        <p className="text-muted mb-0">No payment records found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive bg-white rounded-3 border">
        <table className="table table-custom table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Due Date</th>
              {showCommitmentDetails && <th>Commitment</th>}
              {showCommitmentDetails && <th>Member</th>}
              <th>Amount</th>
              <th>Status</th>
              <th>Days Remaining</th>
              <th>Paid Details</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="fw-semibold">
                  <div>{formatDate(payment.dueDate)}</div>
                </td>
                {showCommitmentDetails && (
                  <td>
                    <div className="fw-medium text-dark">{payment.commitmentTitle || 'Commitment'}</div>
                    <small className="text-muted">{payment.commitmentType}</small>
                  </td>
                )}
                {showCommitmentDetails && (
                  <td>
                    <span className="text-secondary small">
                      <i className="bi bi-person me-1"></i>
                      {payment.familyMemberName || 'Family'}
                    </span>
                  </td>
                )}
                <td>
                  <span className="fw-bold text-dark">{formatCurrency(payment.amount)}</span>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(payment.paymentStatus)}`}>
                    {payment.paymentStatus}
                  </span>
                </td>
                <td>
                  {payment.paymentStatus === 'PAID' ? (
                    <span className="text-success small fw-medium">
                      <i className="bi bi-check-circle-fill me-1"></i> Completed
                    </span>
                  ) : (
                    <span className={`small fw-semibold ${
                      payment.daysRemaining < 0
                        ? 'text-danger'
                        : payment.daysRemaining <= 3
                        ? 'text-warning'
                        : 'text-muted'
                    }`}>
                      {getDaysRemainingLabel(payment.daysRemaining)}
                    </span>
                  )}
                </td>
                <td>
                  {payment.paymentStatus === 'PAID' ? (
                    <div className="small">
                      <span className="text-success fw-semibold">{formatCurrency(payment.paidAmount)}</span>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDate(payment.paidDate)}</div>
                    </div>
                  ) : (
                    <span className="text-muted small">-</span>
                  )}
                </td>
                <td className="text-end">
                  {payment.paymentStatus !== 'PAID' ? (
                    <button
                      className="btn btn-sm btn-success px-3 fw-medium"
                      onClick={() => openPayModal(payment)}
                    >
                      <i className="bi bi-check2-circle me-1"></i> Mark as Paid
                    </button>
                  ) : (
                    <span className="badge bg-light text-muted border px-2 py-1">
                      <i className="bi bi-check2 me-1"></i> Paid
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mark as Paid Modal */}
      {selectedPayment && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handlePaySubmit}>
                <div className="modal-header border-bottom">
                  <div>
                    <h5 className="modal-title fw-bold text-dark">Record Payment</h5>
                    <small className="text-muted">{selectedPayment.commitmentTitle}</small>
                  </div>
                  <button type="button" className="btn-close" onClick={closePayModal}></button>
                </div>

                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-danger py-2 small mb-3">{modalError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small text-muted fw-semibold">Installment Amount</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light fw-bold">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        required
                        step="0.01"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted fw-semibold">Payment Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={paidDate}
                      onChange={(e) => setPaidDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted fw-semibold">Payment Notes / Reference (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. UPI Ref / Netbanking Transaction ID"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="alert alert-info py-2 small mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Marking this as paid will deduct ₹{paidAmount || 0} from the remaining balance and update the overall commitment schedule.
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={closePayModal} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success px-4" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Recording...
                      </>
                    ) : (
                      'Confirm Payment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentTable;
