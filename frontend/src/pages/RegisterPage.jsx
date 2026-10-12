import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    familyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        familyName: formData.familyName || `${formData.fullName}'s Family`
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card shadow-sm border-0 rounded-4" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div className="bg-primary text-white rounded-4 d-inline-flex align-items-center justify-content-center p-3 mb-3 shadow-sm" style={{ width: '56px', height: '56px' }}>
              <i className="bi bi-person-plus-fill fs-3"></i>
            </div>
            <h4 className="fw-bold text-dark">Create Your Account</h4>
            <p className="text-muted small">Manage your family's loans, EMIs & commitments</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="e.g. Rajesh Sharma"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="rajesh@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Family Name</label>
              <input
                type="text"
                name="familyName"
                className="form-control"
                placeholder="e.g. Sharma Family (optional)"
                value={formData.familyName}
                onChange={handleChange}
              />
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>Leave blank to default to your name</small>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold mb-3 rounded-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                'Register & Get Started'
              )}
            </button>
          </form>

          <div className="text-center mt-3 pt-3 border-top small text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
