const mongoose = require('mongoose');

require('../../models/AccessFeatures');
require('../../models/User');

const AccessFeature = mongoose.model('AccessFeature');

describe('AccessFeature model unit validations', () => {
  it('rejects missing name', () => {
    const feature = new AccessFeature({
      description: 'Valid description for the feature.',
      category: 'Mobility',
      createdBy: new mongoose.Types.ObjectId(),
    });

    const error = feature.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('rejects missing description', () => {
    const feature = new AccessFeature({
      name: 'Elevator Access',
      category: 'Mobility',
      createdBy: new mongoose.Types.ObjectId(),
    });

    const error = feature.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.description).toBeDefined();
  });

  it('rejects invalid category', () => {
    const feature = new AccessFeature({
      name: 'Braille Signage',
      description: 'Signage with braille for visually impaired.',
      category: 'InvalidCategory',
      createdBy: new mongoose.Types.ObjectId(),
    });

    const error = feature.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.category).toBeDefined();
  });

  it('accepts valid feature payload', () => {
    const feature = new AccessFeature({
      name: 'Tactile Paving',
      description:
        'Textured ground surface indicators to assist pedestrians who are visually impaired.',
      category: 'Visual',
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
    });

    const error = feature.validateSync();

    expect(error).toBeUndefined();
    expect(feature.category).toBe('Visual');
    expect(feature.isActive).toBe(true);
  });

  it('defaults category to Mobility when not provided', () => {
    const feature = new AccessFeature({
      name: 'Ramp Access',
      description: 'Wheelchair-accessible ramp.',
      createdBy: new mongoose.Types.ObjectId(),
    });

    const error = feature.validateSync();

    expect(error).toBeUndefined();
    expect(feature.category).toBe('Mobility');
  });

  it('defaults isActive to true when not provided', () => {
    const feature = new AccessFeature({
      name: 'Audio Signals',
      description: 'Audible pedestrian signals.',
      category: 'Auditory',
      createdBy: new mongoose.Types.ObjectId(),
    });

    const error = feature.validateSync();

    expect(error).toBeUndefined();
    expect(feature.isActive).toBe(true);
  });
});
