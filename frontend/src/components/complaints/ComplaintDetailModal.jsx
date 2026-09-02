import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare } from 'lucide-react';
import Modal from '../ui/Modal/Modal.jsx';
import Badge from '../ui/Badge/Badge.jsx';
import Button from '../ui/Button/Button.jsx';
import Input from '../ui/Input/Input.jsx';

const ComplaintDetailModal = ({
  isOpen,
  onClose,
  complaint,
  onAddResponse,
  onResolve,
  loading,
}) => {
  const [responseMsg, setResponseMsg] = useState('');

  if (!complaint) return null;

  const handleSendResponse = (e) => {
    e.preventDefault();
    if (!responseMsg.trim()) return;
    onAddResponse(complaint._id, responseMsg.trim());
    setResponseMsg('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={complaint.title} maxWidth="600px">
      <div className="flex flex-col gap-4">
        {/* Complaint Header */}
        <div className="p-4 bg-background border border-border rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <Badge type={complaint.category}>{complaint.category}</Badge>
            <Badge type={complaint.status}>{complaint.status}</Badge>
          </div>
          <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </p>
          <div className="mt-3 pt-2 border-t border-border/60 text-xs text-muted flex justify-between">
            <span>Filed by {complaint.createdBy?.name || 'Partner'}</span>
            <span>{formatDate(complaint.createdAt)}</span>
          </div>
        </div>

        {/* Responses Thread */}
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
            <MessageSquare size={14} />
            <span>Discussion Thread ({complaint.responses?.length || 0})</span>
          </h4>

          {(!complaint.responses || complaint.responses.length === 0) ? (
            <p className="text-xs text-muted italic text-center py-4 bg-surface rounded-lg border border-dashed border-border">
              No responses yet. Write a defense or offer an apology! 😭
            </p>
          ) : (
            complaint.responses.map((resp, idx) => (
              <div key={resp._id || idx} className="p-3 bg-surface border border-border rounded-lg text-sm">
                <div className="flex justify-between items-center text-xs font-semibold text-primary mb-1">
                  <span>{resp.userId?.name || 'Partner'}</span>
                  <span className="text-muted font-normal text-[11px]">{formatDate(resp.createdAt)}</span>
                </div>
                <p className="text-text">{resp.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Response Form */}
        {complaint.status !== 'resolved' && (
          <form onSubmit={handleSendResponse} className="flex gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Write a response..."
              value={responseMsg}
              onChange={(e) => setResponseMsg(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" loading={loading} disabled={!responseMsg.trim()}>
              <Send size={16} />
            </Button>
          </form>
        )}

        {/* Resolve Button */}
        <div className="flex justify-between items-center pt-2">
          {complaint.status !== 'resolved' ? (
            <Button variant="accent" size="sm" onClick={() => onResolve(complaint._id)}>
              <CheckCircle2 size={16} />
              <span>Mark as Resolved</span>
            </Button>
          ) : (
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
              <CheckCircle2 size={14} />
              <span>Resolved on {formatDate(complaint.resolvedAt)}</span>
            </span>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ComplaintDetailModal;
