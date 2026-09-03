import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  ComplaintIcon,
  CheckIcon,
} from '../../components/icons/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Button from '../../components/ui/Button/Button.jsx';
import Loader from '../../components/ui/Loader/Loader.jsx';
import EmptyState from '../../components/ui/EmptyState/EmptyState.jsx';
import Toast from '../../components/ui/Toast/Toast.jsx';
import ComplaintCard from '../../components/complaints/ComplaintCard.jsx';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal.jsx';
import CreateComplaintModal from '../../components/complaints/CreateComplaintModal.jsx';
import complaintService from '../../services/complaint.service.js';
import styles from '../../components/complaints/complaints.module.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'seen', label: 'Seen' },
  { value: 'discussing', label: 'Discussing' },
  { value: 'resolved', label: 'Resolved' },
];

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await complaintService.getComplaints(params);
      setComplaints(data || []);

      if (selectedComplaint) {
        const updated = (data || []).find((c) => c._id === selectedComplaint._id);
        if (updated) setSelectedComplaint(updated);
      }
    } catch (err) {
      setToastMessage(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleOpenDetail = async (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailOpen(true);

    const isCreator = complaint.createdBy?._id === user?._id;
    if (complaint.status === 'pending' && !isCreator) {
      try {
        const updated = await complaintService.updateComplaint(complaint._id, { status: 'seen' });
        setSelectedComplaint(updated);
        fetchComplaints();
      } catch (err) {
        console.error('Error updating complaint status to seen:', err);
      }
    }
  };

  const handleCreateComplaint = async (complaintData) => {
    setSubmitting(true);
    try {
      await complaintService.createComplaint(complaintData);
      setToastMessage('Complaint filed successfully!');
      setIsCreateOpen(false);
      fetchComplaints();
    } catch (err) {
      setToastMessage(err.message || 'Failed to file complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddResponse = async (complaintId, message) => {
    setSubmitting(true);
    try {
      const updated = await complaintService.addResponse(complaintId, message);
      setSelectedComplaint(updated);
      setToastMessage('Response added!');
      fetchComplaints();
    } catch (err) {
      setToastMessage(err.message || 'Failed to add response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    try {
      const updated = await complaintService.resolveComplaint(complaintId);
      setSelectedComplaint(updated);
      setToastMessage('Complaint marked as resolved!');
      fetchComplaints();
    } catch (err) {
      setToastMessage(err.message || 'Failed to resolve complaint');
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await complaintService.deleteComplaint(complaintId);
      setToastMessage('Complaint deleted.');
      if (isDetailOpen && selectedComplaint?._id === complaintId) {
        setIsDetailOpen(false);
      }
      fetchComplaints();
    } catch (err) {
      setToastMessage(err.message || 'Failed to delete complaint');
    }
  };

  return (
    <PageContainer>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Complaint Box</h1>
          <p className={styles.subtitle}>Got something to complain about? File a playful ticket!</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <PlusIcon size={18} />
          <span>File a Complaint</span>
        </Button>
      </div>

      <div className={styles.filterBar}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.value}
            className={`${styles.filterBtn} ${statusFilter === s.value ? styles.activeFilter : ''}`}
            onClick={() => setStatusFilter(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader message="Fetching complaint box..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<ComplaintIcon size={40} className="text-primary" />}
          title="No complaints found"
          description={
            statusFilter === 'all'
              ? 'Everything is peaceful! No complaints filed yet.'
              : `No complaints under "${statusFilter}" status.`
          }
          action={
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              <PlusIcon size={16} />
              <span>File Complaint</span>
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {complaints.map((c) => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              currentUserId={user?._id}
              onClick={() => handleOpenDetail(c)}
              onDelete={handleDeleteComplaint}
            />
          ))}
        </div>
      )}

      <ComplaintDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        complaint={selectedComplaint}
        onAddResponse={handleAddResponse}
        onResolve={handleResolveComplaint}
        loading={submitting}
      />

      <CreateComplaintModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateComplaint}
        loading={submitting}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </PageContainer>
  );
};

export default Complaints;
