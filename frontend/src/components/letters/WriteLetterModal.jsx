import React, { useState } from 'react';
import Modal from '../ui/Modal/Modal.jsx';
import Input from '../ui/Input/Input.jsx';
import Button from '../ui/Button/Button.jsx';

const WriteLetterModal = ({ isOpen, onClose, onSend, partnerName, partnerId, loading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!partnerId) {
      alert('Recipient information unavailable');
      return;
    }
    onSend({
      to: partnerId,
      title,
      content,
      scheduledFor: isScheduled && scheduledFor ? scheduledFor : null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Letter 💌" maxWidth="560px">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="p-3.5 bg-surface-alt border border-border rounded-lg text-xs font-semibold text-text flex items-center justify-between">
          <span>Recipient:</span>
          <span className="text-primary font-bold">{partnerName || 'Your Love'}</span>
        </div>

        <Input
          label="Title / Subject"
          placeholder="For my love, Open when..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Letter Content"
          type="textarea"
          placeholder="Write your heart out..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isScheduled"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
          <label htmlFor="isScheduled" className="text-sm font-semibold text-text cursor-pointer">
            Schedule for a future date (Valentine's, Anniversary...)
          </label>
        </div>

        {isScheduled && (
          <Input
            label="Unlock Date"
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            required={isScheduled}
          />
        )}

        <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Send Letter 💌
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WriteLetterModal;
