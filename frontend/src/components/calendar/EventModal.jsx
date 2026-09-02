import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal/Modal.jsx';
import Input from '../ui/Input/Input.jsx';
import Select from '../ui/Select/Select.jsx';
import Button from '../ui/Button/Button.jsx';

const EVENT_TYPES = [
  { value: 'anniversary', label: '❤️ Anniversary' },
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'first_date', label: '🌸 First Date' },
  { value: 'trip', label: '✈️ Trip' },
  { value: 'special_day', label: '✨ Special Day' },
  { value: 'custom', label: '💫 Custom' },
];

const RECURRENCE_RULES = [
  { value: 'yearly', label: 'Every Year (Yearly)' },
  { value: 'monthly', label: 'Every Month (Monthly)' },
  { value: 'weekly', label: 'Every Week (Weekly)' },
];

const EventModal = ({ isOpen, onClose, onSave, eventToEdit, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('special_day');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState('none');

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setDescription(eventToEdit.description || '');
      setDate(
        eventToEdit.date
          ? new Date(eventToEdit.date).toISOString().split('T')[0]
          : ''
      );
      setType(eventToEdit.type || 'special_day');
      setStartTime(eventToEdit.startTime || '');
      setEndTime(eventToEdit.endTime || '');
      setIsRecurring(eventToEdit.isRecurring || false);
      setRecurrenceRule(eventToEdit.recurrenceRule || 'none');
    } else {
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('special_day');
      setStartTime('');
      setEndTime('');
      setIsRecurring(false);
      setRecurrenceRule('none');
    }
  }, [eventToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      description,
      date,
      type,
      startTime: startTime || null,
      endTime: endTime || null,
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : 'none',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Edit Special Day 📅' : 'Add Special Day 📅'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Event Title"
          placeholder="Our Anniversary, Coffee Date..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Select
          label="Category"
          options={EVENT_TYPES}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Time (Optional)"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="End Time (Optional)"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <Input
          label="Description (Optional)"
          type="textarea"
          placeholder="Details about where we're going or what we're planning..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isRecurring"
            checked={isRecurring}
            onChange={(e) => {
              setIsRecurring(e.target.checked);
              if (e.target.checked && recurrenceRule === 'none') {
                setRecurrenceRule('yearly');
              }
            }}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
          <label htmlFor="isRecurring" className="text-sm font-semibold text-text cursor-pointer">
            Recurring Event
          </label>
        </div>

        {isRecurring && (
          <Select
            label="Recurrence Rule"
            options={RECURRENCE_RULES}
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value)}
          />
        )}

        <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {eventToEdit ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EventModal;
