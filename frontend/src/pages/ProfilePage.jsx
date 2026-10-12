import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getProfile();
        setProfile(res.data);
        setFullName(res.data.fullName || '');
        setPhone(res.data.phone || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileError('');
      setProfileSuccess('');
      const res = await userAPI.updateProfile({ fullName, phone });
      setProfile(res.data);
      updateUser({ fullName: res.data.fullName });
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      setPasswordSaving(true);
      await userAPI.changePassword({ oldPassword, newPassword });
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading user profile..." />;

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">User Profile & Security</h2>
        <p className="text-muted small mb-0">Manage your account information and authentication credentials</p>
      </div>

      <div className="row g-4">
        {/* Personal Details */}
        <div className="col-12 col-lg-6">
          <div className="card custom-card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-person-badge me-2 text-primary"></i>
                Personal Details
              </h5>
            </div>
            <div className="card-body p-4">
              {profileSuccess && (
                <div className="alert alert-success py-2 small mb-3">
                  <i className="bi bi-check-circle me-1"></i> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="alert alert-danger py-2 small mb-3">{profileError}</div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={profile?.email || ''}
                    disabled
                  />
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>Email cannot be modified</small>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <span className="text-muted small d-block">Account Created</span>
                  <span className="small fw-semibold text-dark">{formatDate(profile?.createdAt)}</span>
                </div>

                <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Update Details'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="col-12 col-lg-6">
          <div className="card custom-card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-shield-lock me-2 text-primary"></i>
                Security & Password
              </h5>
            </div>
            <div className="card-body p-4">
              {passwordSuccess && (
                <div className="alert alert-success py-2 small mb-3">
                  <i className="bi bi-check-circle me-1"></i> {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="alert alert-danger py-2 small mb-3">{passwordError}</div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                  {passwordSaving ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
