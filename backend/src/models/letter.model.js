import mongoose from 'mongoose';

const letterSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender (from) is required'],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient (to) is required'],
    },
    title: {
      type: String,
      required: [true, 'Letter title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Letter content is required'],
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    openedAt: {
      type: Date,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup by recipient, scheduled release date, and sender
letterSchema.index({ to: 1, scheduledFor: 1 });
letterSchema.index({ from: 1 });

const Letter = mongoose.model('Letter', letterSchema);

export default Letter;
