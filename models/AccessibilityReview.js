const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const accessibilityReviewSchema = new Schema({
  // Reference to the public space being reviewed
  spaceId: {
    type: Schema.Types.ObjectId,
    ref: "Space", // Will reference a Space model if/when your teammates create it
    required: true,
  },
  // Reference to the user who wrote the review
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Overall accessibility rating (1-5)
  rating: {
    type: Number,
    required: true,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"],
  },
  // Detailed review comment
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, "Comment must be at least 10 characters long"],
    maxlength: [1000, "Comment cannot exceed 1000 characters"],
  },
  // Array of accessibility features observed at the space
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
        enum: ["excellent", "good", "fair", "poor", "not_available"],
        default: "not_available",
      },
    },
  ],
  // Title for the review
  title: {
    type: String,
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"],
  },
  // Soft delete flag
  removed: {
    type: Boolean,
    default: false,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
accessibilityReviewSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

accessibilityReviewSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Prevent OverwriteModelError: only compile if not already compiled
module.exports =
  mongoose.models.AccessibilityReview ||
  mongoose.model("AccessibilityReview", accessibilityReviewSchema);