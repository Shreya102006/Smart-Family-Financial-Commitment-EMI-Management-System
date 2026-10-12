import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { familyAPI, familyMemberAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AddFamilyMemberPage = () => {
  const [families, setFamilies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Spouse',
    email: '',
    phone: '',
    familyId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const res = await familyAPI.getFamilies();
        setFamilies(res.data || []);
        if (res.data && res.data.length > 0) {
          setFormData((prev) => ({ ...prev, familyId: res.data[0].id }));
        }
      } catch (err) {
        setError('Failed to load family information');
      } finally {
        setLoading(false);
      }
    };
    fetchFamilies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await familyMemberAPI.addMember(formData);
      navigate('/family');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Link to="/family" className="btn btn-sm btn-light border">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h2 className="fw-bold text-dark mb-0">Add Family Member</h2>
          <p className="text-muted small mb-0">Add a new family member to track their loans and contributions</p>
        </div>
      </div>

      <div className="card custom-card border-0 shadow-sm" style={{ maxWidth: '640px' }}>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Aaradhya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Relationship</label>
              <select
                className="form-select"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                required
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Parent">Parent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Email (Optional)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="member@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Phone (Optional)</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {families.length > 1 && (
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Family</label>
                <select
                  className="form-select"
                  value={formData.familyId}
                  onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                  required
                >
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>{f.familyName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
              <Link to="/family" className="btn btn-light">Cancel</Link>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? 'Saving...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFamilyMemberPage;
