import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { commitmentAPI, familyAPI, familyMemberAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AddCommitmentPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Home Loan EMI',
    description: '',
    amount: '',
    totalAmount: '',
    frequency: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dueDateDay: '5',
    interestRate: '',
    familyMemberId: '',
    familyId: ''
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

  const frequencies = [
    'Monthly',
    'Quarterly',
    'Half-Yearly',
    'Yearly',
    'One-Time'
  ];

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [famRes, memRes] = await Promise.all([
          familyAPI.getFamilies(),
          familyMemberAPI.getMembers()
        ]);
        setFamilies(famRes.data || []);
        setMembers(memRes.data || []);

        const defaultFamId = famRes.data?.[0]?.id || '';

        if (isEditing) {
          const comRes = await commitmentAPI.getCommitmentById(id);
          const c = comRes.data;
          setFormData({
            title: c.title || '',
            type: c.type || 'Home Loan EMI',
            description: c.description || '',
            amount: c.amount || '',
            totalAmount: c.totalAmount || '',
            frequency: c.frequency || 'Monthly',
            startDate: c.startDate || '',
            endDate: c.endDate || '',
            dueDateDay: c.dueDateDay || '5',
            interestRate: c.interestRate || '',
            familyMemberId: c.familyMemberId || '',
            familyId: c.familyId || defaultFamId
          });
        } else {
          setFormData((prev) => ({ ...prev, familyId: defaultFamId }));
        }
      } catch (err) {
        setError('Failed to load form prerequisites');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        amount: parseFloat(formData.amount),
        totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : null,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        dueDateDay: formData.dueDateDay ? parseInt(formData.dueDateDay, 10) : null,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : null,
        familyMemberId: formData.familyMemberId ? parseInt(formData.familyMemberId, 10) : null,
        familyId: parseInt(formData.familyId, 10)
      };

      if (isEditing) {
        await commitmentAPI.updateCommitment(id, payload);
      } else {
        await commitmentAPI.createCommitment(payload);
      }

      navigate('/commitments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save commitment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing commitment form..." />;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Link to="/commitments" className="btn btn-sm btn-light border">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h2 className="fw-bold text-dark mb-0">
            {isEditing ? 'Edit Commitment' : 'Add Financial Commitment'}
          </h2>
          <p className="text-muted small mb-0">
            {isEditing
              ? 'Update the terms, amount, or dates for this obligation'
              : 'Add an EMI, loan, fee, or bill. The system will automatically generate the schedule.'}
          </p>
        </div>
      </div>

      <div className="card custom-card border-0 shadow-sm" style={{ maxWidth: '800px' }}>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-8">
                <label className="form-label small fw-semibold text-secondary">Commitment Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. SBI Home Loan EMI / Aaradhya DPS School Fee"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Commitment Type</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  {commitmentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Description / Account Notes (Optional)</label>
              <textarea
                name="description"
                rows="2"
                className="form-control"
                placeholder="e.g. Loan Account No: 123456789, Branch: Indiranagar"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Installment Amount (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light fw-bold">₹</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="1"
                    className="form-control"
                    placeholder="25000"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Total Loan / Target Amount (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light fw-bold">₹</span>
                  <input
                    type="number"
                    name="totalAmount"
                    step="0.01"
                    className="form-control"
                    placeholder="Auto-calculated if blank"
                    value={formData.totalAmount}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Repayment Frequency</label>
                <select
                  name="frequency"
                  className="form-select"
                  value={formData.frequency}
                  onChange={handleChange}
                  required
                >
                  {frequencies.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Monthly Due Day (1-31)</label>
                <input
                  type="number"
                  name="dueDateDay"
                  min="1"
                  max="31"
                  className="form-control"
                  placeholder="e.g. 5"
                  value={formData.dueDateDay}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Interest Rate % (Optional)</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="interestRate"
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="e.g. 8.5"
                    value={formData.interestRate}
                    onChange={handleChange}
                  />
                  <span className="input-group-text bg-light">%</span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Assigned Family Member</label>
                <select
                  name="familyMemberId"
                  className="form-select"
                  value={formData.familyMemberId}
                  onChange={handleChange}
                >
                  <option value="">-- Household / Shared --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relationship})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Family Group</label>
                <select
                  name="familyId"
                  className="form-select"
                  value={formData.familyId}
                  onChange={handleChange}
                  required
                >
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>{f.familyName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Link to="/commitments" className="btn btn-light">Cancel</Link>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Generating Schedule...
                  </>
                ) : isEditing ? (
                  'Update Commitment'
                ) : (
                  'Create Commitment & Schedule'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCommitmentPage;
