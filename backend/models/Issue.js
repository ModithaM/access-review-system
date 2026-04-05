const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const issueSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [300, 'Location cannot exceed 300 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: [
        'Mobility Access',
        'Visual Access',
        'Hearing Access',
        'Parking',
        'Restrooms',
        'Signage',
        'Elevators',
        'Other',
      ],
      default: 'Other',
      index: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
      index: true,
    },
    reporter: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true,
      maxlength: [100, 'Reporter name cannot exceed 100 characters'],
    },
    reporterEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
      default: '',
    },
    responseTime: {
      type: Date,
    },
    resolutionTime: {
      type: Date,
    },
    removed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Update the updatedAt field before saving
issueSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

issueSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Indexes for common queries
issueSchema.index({ status: 1, severity: 1, createdAt: -1 });
issueSchema.index({ category: 1, createdAt: -1 });
issueSchema.index({ userId: 1, createdAt: -1 });
issueSchema.index({ removed: false, createdAt: -1 }, { name: 'active_issues_by_date' });

// Prevent OverwriteModelError
module.exports = mongoose.models.Issue || mongoose.model('Issue', issueSchema);
