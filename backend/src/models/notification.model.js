import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'LETTER_RECEIVED',
  'COMPLAINT_FILED',
  'EVENT_REMINDER',
  'EVENT_ADDED',
  'COMPLAINT_COMMENTED',
  'MOMENT_REACTION',
  'MOMENT_COMMENT',
  'CHAT_MESSAGE',
  'USLY_UPDATE',
];

export const NOTIFICATION_IMPORTANCE = ['priority', 'informative', 'activity'];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: NOTIFICATION_TYPES,
        message: '{VALUE} is not a valid notification type',
      },
    },
    importance: {
      type: String,
      required: [true, 'Notification importance is required'],
      enum: {
        values: NOTIFICATION_IMPORTANCE,
        message: '{VALUE} is not a valid importance level',
      },
      default: 'activity',
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    entityType: {
      type: String,
      default: null,
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    details: {
      heading: {
        type: String,
        default: null,
        trim: true,
      },
      content: {
        type: String,
        default: null,
        trim: true,
      },
      changes: [
        {
          type: String,
          trim: true,
        },
      ],
      imageUrl: {
        type: String,
        default: null,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient recipient feed queries and unread counting
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
