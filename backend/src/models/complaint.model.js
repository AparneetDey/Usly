import mongoose from 'mongoose';

const COMPLAINT_CATEGORIES = [
  'food',
  'late',
  'ignored',
  'annoying',
  'serious',
  'funny',
  'other',
];

const COMPLAINT_STATUSES = ['pending', 'seen', 'discussing', 'resolved'];

// Embedded Complaint Response Subdocument Schema
const complaintResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Response author userId is required'],
    },
    message: {
      type: String,
      required: [true, 'Response message is required'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const complaintSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Complaint creator is required'],
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Complaint category is required'],
      enum: {
        values: COMPLAINT_CATEGORIES,
        message: '{VALUE} is not a valid complaint category',
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: COMPLAINT_STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    responses: [complaintResponseSchema],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying complaints by status and author
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdBy: 1, status: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
