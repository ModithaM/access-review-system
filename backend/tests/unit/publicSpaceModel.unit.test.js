const mongoose = require('mongoose');
require('../../models/PublicSpace');
const PublicSpace = mongoose.model('PublicSpace');

describe('PublicSpace model unit validations', () => {
  it('rejects missing name', () => {
    const space = new PublicSpace({
      category: 'Mall',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
    });

    const error = space.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('rejects missing category', () => {
    const space = new PublicSpace({
      name: 'Central Park',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
    });

    const error = space.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.category).toBeDefined();
  });

  it('rejects missing locationDetails.address', () => {
    const space = new PublicSpace({
      name: 'Central Park',
      category: 'Park',
      locationDetails: {
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
    });

    const error = space.validateSync();

    expect(error).toBeDefined();
    expect(error.errors['locationDetails.address']).toBeDefined();
  });

  it('rejects missing locationDetails.coordinates.lat', () => {
    const space = new PublicSpace({
      name: 'Central Park',
      category: 'Park',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lng: -74.006,
        },
      },
    });

    const error = space.validateSync();

    expect(error).toBeDefined();
    expect(error.errors['locationDetails.coordinates.lat']).toBeDefined();
  });

  it('rejects missing locationDetails.coordinates.lng', () => {
    const space = new PublicSpace({
      name: 'Central Park',
      category: 'Park',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lat: 40.7128,
        },
      },
    });

    const error = space.validateSync();

    expect(error).toBeDefined();
    expect(error.errors['locationDetails.coordinates.lng']).toBeDefined();
  });

  it('rejects invalid category enum value', () => {
    const space = new PublicSpace({
      name: 'Central Park',
      category: 'Invalid',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
    });

    const error = space.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.category).toBeDefined();
  });

  it('accepts valid category enum values', () => {
    for (const category of ['Mall', 'Park', 'Hospital', 'Station', 'Other']) {
      const space = new PublicSpace({
        name: 'Test Space',
        category,
        locationDetails: {
          address: '123 Main St',
          coordinates: {
            lat: 40.7128,
            lng: -74.006,
          },
        },
      });

      const error = space.validateSync();

      expect(error).toBeUndefined();
    }
  });

  it('applies default values correctly', () => {
    const space = new PublicSpace({
      name: 'Central Park',
      category: 'Park',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
    });

    const error = space.validateSync();
    expect(error).toBeUndefined();

    expect(space.imageUrl).toBe('../public/uploads/publicSpaces/default-space.jpg');
  });

  it('trims name', () => {
    const space = new PublicSpace({
      name: '  Central Park  ',
      category: 'Park',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
    });

    expect(space.name).toBe('Central Park');
  });

  it('trims imageUrl', () => {
    const space = new PublicSpace({
      name: 'Central Park',
      category: 'Park',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
      imageUrl: '  /path/to/image.jpg  ',
    });

    expect(space.imageUrl).toBe('/path/to/image.jpg');
  });

  it('accepts a valid public space payload', () => {
    const space = new PublicSpace({
      name: 'Central Park',
      category: 'Park',
      locationDetails: {
        address: '123 Main St',
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
      imageUrl: '/uploads/park.jpg',
      description: 'A famous park in NYC.',
    });

    const error = space.validateSync();

    expect(error).toBeUndefined();
  });
});
