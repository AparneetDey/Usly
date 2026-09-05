import mongoose from 'mongoose';

const ALLOWED_EVENT_TYPES = [
  'anniversary',
  'birthday',
  'first_date',
  'trip',
  'special_day',
  'custom',
];

const RECURRENCE_RULES = ['yearly', 'monthly', 'weekly', 'none'];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    type: {
      type: String,
      enum: {
        values: ALLOWED_EVENT_TYPES,
        message: '{VALUE} is not a valid event type',
      },
      default: 'special_day',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event creator is required'],
    },
    startTime: {
      type: String,
      trim: true,
      default: null,
    },
    endTime: {
      type: String,
      trim: true,
      default: null,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceRule: {
      type: String,
      enum: {
        values: RECURRENCE_RULES,
        message: '{VALUE} is not a valid recurrence rule',
      },
      default: 'none',
    },
    remindersSent: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for optimizing calendar date queries and date range filtering
eventSchema.index({ date: 1 });
eventSchema.index({ date: 1, type: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
