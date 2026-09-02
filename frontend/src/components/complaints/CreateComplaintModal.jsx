import React, { useState } from 'react';
import Modal from '../ui/Modal/Modal.jsx';
import Input from '../ui/Input/Input.jsx';
import Select from '../ui/Select/Select.jsx';
import Button from '../ui/Button/Button.jsx';

const CATEGORIES = [
  { value: 'food', label: '🍟 Stealing Food' },
  { value: 'late', label: '⏰ Running Late' },
  { value: 'ignored', label: '🙈 Ignored Messages' },
  { value: 'annoying', label: '😜 Mildly Annoying' },
  { value: 'serious', label: '🥺 Serious Concern' },
  { value: 'funny', label: '😂 Funny Complaint' },
  { value: 'other', label: '📌 Other' },
];

const CreateComplaintModal = ({ isOpen, onClose, onCreate, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      title,
      description,
      category,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="File a Complaint 😭" maxWidth="520px">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Complaint Title"
          placeholder="You ate my fries after saying you weren't hungry..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Select
          label="Category"
          options={CATEGORIES}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Input
          label="Description / Evidence"
          type="textarea"
          placeholder="Explain what happened in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />

        <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            File Complaint 😭
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateComplaintModal;
