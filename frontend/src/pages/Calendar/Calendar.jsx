import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  ChevronRightIcon,
} from '../../components/icons/index.js';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Card from '../../components/ui/Card/Card.jsx';
import Button from '../../components/ui/Button/Button.jsx';
import Loader from '../../components/ui/Loader/Loader.jsx';
import Toast from '../../components/ui/Toast/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal/ConfirmModal.jsx';

import CalendarHeader from '../../components/calendar/CalendarHeader/CalendarHeader.jsx';
import CalendarGrid from '../../components/calendar/CalendarGrid/CalendarGrid.jsx';
import CalendarLegend from '../../components/calendar/CalendarLegend/CalendarLegend.jsx';
import EventModal from '../../components/calendar/EventModal.jsx';
import EventDetailModal from '../../components/calendar/EventDetailModal/EventDetailModal.jsx';

import { getDaysForMonthGrid, formatCalendarDate, isToday } from '../../components/calendar/dateUtils.js';
import { getCategoryConfig } from '../../components/calendar/categoryColors.js';
import eventService from '../../services/event.service.js';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEvents({ year: currentYear });
      setEvents(data || []);
    } catch (err) {
      setToastMessage(err.message || 'Couldn\'t load your calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentYear, currentMonth]);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay({
      date: today,
      dateString: formatCalendarDate(today),
      dayNumber: today.getDate(),
      isCurrentMonth: true,
    });
  };

  const handleYearChange = (newYear) => {
    setCurrentDate(new Date(newYear, currentMonth, 1));
  };

  // Day selection
  const handleSelectDay = (day) => {
    setSelectedDay(day);
  };

  // Event actions
  const handleOpenAddModal = (initialDate = null) => {
    setEventToEdit(
      initialDate
        ? { date: initialDate }
        : selectedDay
        ? { date: selectedDay.dateString }
        : null
    );
    setIsAddEditOpen(true);
  };

  const handleOpenEventDetail = (evt) => {
    setSelectedEvent(evt);
    setIsDetailOpen(true);
  };

  const handleOpenEditFromDetail = (evt) => {
    setIsDetailOpen(false);
    setEventToEdit(evt);
    setIsAddEditOpen(true);
  };

  const handleOpenDeleteConfirm = (evt) => {
    setIsDetailOpen(false);
    setEventToDelete(evt);
    setIsConfirmOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    setSubmitting(true);
    try {
      if (eventToEdit && eventToEdit._id) {
        await eventService.updateEvent(eventToEdit._id, eventData);
        setToastMessage('Memory updated successfully!');
      } else {
        await eventService.createEvent(eventData);
        setToastMessage('Special day added to calendar!');
      }
      setIsAddEditOpen(false);
      fetchEvents();
    } catch (err) {
      setToastMessage(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setSubmitting(true);
    try {
      await eventService.deleteEvent(eventToDelete._id);
      setToastMessage('Event removed from your calendar.');
      setIsConfirmOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (err) {
      setToastMessage(err.message || 'Failed to delete event');
    } finally {
      setSubmitting(false);
    }
  };

  const gridDays = getDaysForMonthGrid(currentYear, currentMonth);

  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <PageContainer>
      {/* Calendar Header Controls */}
      <CalendarHeader
        currentYear={currentYear}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onYearChange={handleYearChange}
        onAddEvent={() => handleOpenAddModal()}
      />

      {/* Category Color Legend */}
      <CalendarLegend />

      {loading ? (
        <Loader message="Loading your romantic calendar..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main 7-Column Calendar Grid */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <CalendarGrid
              days={gridDays}
              events={events}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              onEventClick={handleOpenEventDetail}
            />

            {/* Selected Date Quick Banner */}
            {selectedDay && (
              <Card className="flex items-center justify-between p-4 bg-surface border-border">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-primary" />
                  <span className="font-bold text-text text-sm">
                    {formatDate(selectedDay.date)}
                  </span>
                  {isToday(selectedDay.date) && (
                    <span className="text-xs bg-primary text-surface px-2 py-0.5 rounded-full font-bold">
                      Today
                    </span>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenAddModal(selectedDay.dateString)}
                >
                  <PlusIcon size={14} />
                  <span>Add Event to Date</span>
                </Button>
              </Card>
            )}
          </div>

          {/* Side Panel: Upcoming Events */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-bold text-text text-base flex items-center gap-1.5">
                  <CalendarIcon size={18} className="text-primary" />
                  <span>Upcoming</span>
                </h3>
                <span className="text-xs text-muted font-semibold">Next 5</span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted italic">
                  Nothing special planned yet. Maybe add something?
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {upcomingEvents.map((evt) => {
                    const config = getCategoryConfig(evt.type);
                    return (
                      <div
                        key={evt._id}
                        onClick={() => handleOpenEventDetail(evt)}
                        className="p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        style={{
                          backgroundColor: config.bg,
                          borderColor: config.border,
                          color: config.text,
                        }}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-base">{config.emoji}</span>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-xs truncate">
                              {evt.title}
                            </span>
                            <span className="text-[11px] opacity-80">
                              {formatDate(evt.date)}
                            </span>
                          </div>
                        </div>
                        <ChevronRightIcon size={14} className="opacity-60 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Add / Edit Event Form Modal */}
      <EventModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveEvent}
        eventToEdit={eventToEdit}
        loading={submitting}
      />

      {/* Single Event Detail Modal */}
      <EventDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        event={selectedEvent}
        onEdit={handleOpenEditFromDetail}
        onDelete={handleOpenDeleteConfirm}
      />

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Special Day?"
        message={`Are you sure you want to delete "${eventToDelete?.title}"? This memory will be removed from your calendar.`}
        confirmText="Delete Event"
        loading={submitting}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </PageContainer>
  );
};

export default Calendar;
