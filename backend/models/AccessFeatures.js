const mongoose = require('mongoose');

const accessFeatureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a feature name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      enum: ['Mobility', 'Visual', 'Auditory', 'Cognitive', 'Other'],
      default: 'Mobility',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('AccessFeature', accessFeatureSchema);
