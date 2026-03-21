const mongoose = require('mongoose');

require('../../models/AccessibilityReview');

const AccessibilityReview = mongoose.model('AccessibilityReview');

describe('AccessibilityReview model unit validations', () => {
  it('rejects rating outside 1-5 range', () => {
    const review = new AccessibilityReview({
      spaceId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      rating: 6,
      comment: 'This comment is long enough to pass minimum length validation.',
      features: [],
      title: 'Invalid rating case',
    });

    const error = review.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.rating).toBeDefined();
  });

  it('rejects short comment values', () => {
    const review = new AccessibilityReview({
      spaceId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      rating: 4,
      comment: 'Too short',
      features: [],
      title: 'Short comment',
    });

    const error = review.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.comment).toBeDefined();
  });

  it('accepts valid review payload', () => {
    const review = new AccessibilityReview({
      spaceId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: 'This public space has excellent ramps and clear signage for accessibility.',
      features: [
        {
          featureName: 'Wheelchair Ramp',
          available: true,
          condition: 'excellent',
        },
      ],
      title: 'Excellent access',
    });

    const error = review.validateSync();

    expect(error).toBeUndefined();
  });
});
