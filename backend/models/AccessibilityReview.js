const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const accessibilityReviewSchema = new Schema(
  {
    spaceId: {
      type: Schema.Types.ObjectId,
      ref: 'PublicSpace',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters long'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    features: [
      {
        featureName: {
          type: String,
          required: true,
          trim: true,
        },
        available: {
          type: Boolean,
          default: false,
        },
        condition: {
          type: String,
          enum: ['excellent', 'good', 'fair', 'poor', 'not_available'],
          default: 'not_available',
        },
      },
    ],
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
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
accessibilityReviewSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

accessibilityReviewSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

accessibilityReviewSchema.index(
  { spaceId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { removed: false },
    name: 'uniq_active_review_per_user_space',
  },
);

accessibilityReviewSchema.index({ spaceId: 1, createdAt: -1 });
accessibilityReviewSchema.index({ userId: 1, createdAt: -1 });

// Prevent OverwriteModelError: only compile if not already compiled
module.exports =
  mongoose.models.AccessibilityReview ||
  mongoose.model('AccessibilityReview', accessibilityReviewSchema);
