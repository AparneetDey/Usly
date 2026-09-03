import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reaction: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const momentSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Moment creator is required'],
    },
    media: {
      url: {
        type: String,
        required: [true, 'Media URL is required'],
        trim: true,
      },
      fileId: {
        type: String,
        required: [true, 'Media fileId is required for ImageKit cleanup'],
        trim: true,
      },
      type: {
        type: String,
        enum: ['image', 'video'],
        required: [true, 'Media type must be image or video'],
      },
    },
    caption: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    duration: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    reactions: [reactionSchema],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

const Moment = mongoose.model('Moment', momentSchema);

export default Moment;
