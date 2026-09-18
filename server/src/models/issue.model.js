import mongoose from 'mongoose';

const CATEGORIES = ['wifi', 'electricity', 'water', 'mess', 'furniture', 'cleanliness', 'security', 'ragging_desk', 'other'];
const STATUSES = ['open', 'in_progress', 'resolved', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high'];

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Invalid issue category'
      }
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Invalid issue status'
      },
      default: 'open'
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITIES,
        message: 'Invalid issue priority'
      },
      default: 'medium'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    imagePublicId: {
      type: String,
      default: ''
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user ID is required']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    resolutionNote: {
      type: String,
      trim: true,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating upvote count dynamically
issueSchema.virtual('upvoteCount').get(function () {
  return this.upvotes ? this.upvotes.length : 0;
});

// Text index for full-text keyword search across title & description
issueSchema.index({ title: 'text', description: 'text' });

// Compound index to optimize default feed queries (filtering status & sorting by newest first)
issueSchema.index({ status: 1, createdAt: -1 });

// Single field indexes for fast user specific queries
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ assignedTo: 1 });

issueSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const Issue = mongoose.model('Issue', issueSchema);
