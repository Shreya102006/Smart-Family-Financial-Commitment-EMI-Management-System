import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { familyAPI, familyMemberAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils/formatters';

const FamilyPage = () => {
  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit / Add Modal state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    relationship: 'Spouse',
    email: '',
    phone: '',
    familyId: ''
  });
  const [modalSaving, setModalSaving] = useState(false);

  // Delete modal state
  const [deleteMemberTarget, setDeleteMemberTarget] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const famRes = await familyAPI.getFamilies();
      setFamilies(famRes.data || []);

      const memRes = await familyMemberAPI.getMembers();
      setMembers(memRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      relationship: 'Spouse',
      email: '',
      phone: '',
      familyId: families[0]?.id || ''
    });
    setShowMemberModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      relationship: member.relationship,
      email: member.email || '',
      phone: member.phone || '',
      familyId: member.familyId
    });
    setShowMemberModal(true);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      setModalSaving(true);
      if (editingMember) {
        await familyMemberAPI.updateMember(editingMember.id, memberForm);
      } else {
        await familyMemberAPI.addMember(memberForm);
      }
      setShowMemberModal(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving family member');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteMemberTarget) return;
    try {
      await familyMemberAPI.deleteMember(deleteMemberTarget.id);
      setDeleteMemberTarget(null);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete member');
    }
  };

  if (loading) return <LoadingSpinner message="Loading family and members..." />;

  const primaryFamily = families[0];

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Family Management</h2>
          <p className="text-muted small mb-0">Organize household members and link their individual loan/EMI commitments</p>
        </div>
        <div>
          <button className="btn btn-primary d-flex align-items-center gap-2 px-3 shadow-sm" onClick={openAddModal}>
            <i className="bi bi-person-plus-fill"></i>
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Primary Family Overview Card */}
      {primaryFamily && (
        <div className="card custom-card border-0 shadow-sm mb-4 bg-primary text-white p-4 rounded-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <span className="badge bg-white text-primary mb-2 px-3 py-1 fw-bold">Primary Family Hub</span>
              <h3 className="fw-bold mb-1">{primaryFamily.familyName}</h3>
              <p className="mb-0 text-white-50 small">
                Managed by {primaryFamily.ownerName} &bull; Created on {formatDate(primaryFamily.createdAt)}
              </p>
            </div>
            <div className="d-flex gap-3">
              <div className="bg-white bg-opacity-25 p-3 rounded-3 text-center">
                <span className="d-block display-6 fw-bold">{members.length}</span>
                <span className="small text-white-50">Members</span>
              </div>
              <div className="bg-white bg-opacity-25 p-3 rounded-3 text-center">
                <span className="d-block display-6 fw-bold">{primaryFamily.commitmentCount}</span>
                <span className="small text-white-50">Commitments</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Family Members Grid */}
      <div className="card custom-card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark">
            <i className="bi bi-people-fill me-2 text-primary"></i>
            Family Members Directory ({members.length})
          </span>
        </div>
        <div className="card-body p-4">
          {members.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted display-4 d-block mb-3"></i>
              <h5 className="fw-bold text-dark">No family members added yet</h5>
              <p className="text-muted small mb-4">Add your family members to allocate loans, school fees, and EMIs.</p>
              <button className="btn btn-primary" onClick={openAddModal}>
                <i className="bi bi-person-plus me-1"></i> Add First Member
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {members.map((member) => (
                <div key={member.id} className="col-12 col-md-6 col-xl-4">
                  <div className="card border rounded-3 p-3 h-100 shadow-sm hover-shadow">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 flex-shrink-0"
                        style={{ width: '50px', height: '50px' }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="fw-bold text-dark mb-1 text-truncate">{member.name}</h6>
                          <span className="badge bg-light text-secondary border small">
                            {member.relationship}
                          </span>
                        </div>
                        <p className="text-muted small mb-1">
                          <i className="bi bi-envelope me-1"></i> {member.email || 'No email provided'}
                        </p>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-telephone me-1"></i> {member.phone || 'No phone provided'}
                        </p>
                        <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                          <span className="badge bg-primary-subtle text-primary small">
                            {member.commitmentCount} Commitment{member.commitmentCount !== 1 ? 's' : ''}
                          </span>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-light border text-secondary"
                              onClick={() => openEditModal(member)}
                              title="Edit Member"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-light border text-danger"
                              onClick={() => setDeleteMemberTarget(member)}
                              title="Delete Member"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {showMemberModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleMemberSubmit}>
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold text-dark">
                    {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowMemberModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Aaradhya Sharma"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Relationship</label>
                    <select
                      className="form-select"
                      value={memberForm.relationship}
                      onChange={(e) => setMemberForm({ ...memberForm, relationship: e.target.value })}
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

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Email Address (Optional)</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="member@example.com"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    />
                  </div>

                  {families.length > 1 && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Select Family</label>
                      <select
                        className="form-select"
                        value={memberForm.familyId}
                        onChange={(e) => setMemberForm({ ...memberForm, familyId: e.target.value })}
                        required
                      >
                        {families.map((f) => (
                          <option key={f.id} value={f.id}>{f.familyName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowMemberModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={modalSaving}>
                    {modalSaving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={!!deleteMemberTarget}
        title="Delete Family Member"
        message={`Are you sure you want to remove ${deleteMemberTarget?.name}? Commitments linked to this member will remain in the family records.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteMemberTarget(null)}
      />
    </div>
  );
};

export default FamilyPage;
