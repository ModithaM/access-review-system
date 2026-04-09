const mongoose = require('mongoose');

const publicSpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Mall', 'Park', 'Hospital', 'Station', 'Other'],
      required: true,
    },
    locationDetails: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        // Latitude and Longitude
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '../public/uploads/publicSpaces/default-space.jpg',
    },
    description: {
      type: String,
    },
    accessFeatures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessFeature',
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

publicSpaceSchema.virtual('accessibilityReviews', {
  ref: 'AccessibilityReview',
  localField: '_id',
  foreignField: 'spaceId',
});

module.exports = mongoose.model('PublicSpace', publicSpaceSchema);
