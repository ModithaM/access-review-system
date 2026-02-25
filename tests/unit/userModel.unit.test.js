const mongoose = require('mongoose');
require('../../models/User');
const User = mongoose.model('User');

describe('User model unit validations', () => {
  it('rejects missing email', () => {
    const user = new User({
      password: 'securepassword123',
      name: 'John',
      surname: 'Doe',
    });

    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('rejects missing password', () => {
    const user = new User({
      email: 'john@example.com',
      name: 'John',
      surname: 'Doe',
    });

    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it('rejects missing name', () => {
    const user = new User({
      email: 'john@example.com',
      password: 'securepassword123',
      surname: 'Doe',
    });

    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('rejects missing surname', () => {
    const user = new User({
      email: 'john@example.com',
      password: 'securepassword123',
      name: 'John',
    });

    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.surname).toBeDefined();
  });

  it('rejects invalid userType enum value', () => {
    const user = new User({
      email: 'john@example.com',
      password: 'securepassword123',
      name: 'John',
      surname: 'Doe',
      userType: 'superadmin',
    });

    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.userType).toBeDefined();
  });

  it('accepts valid userType enum values', () => {
    for (const userType of ['admin', 'user', 'guest']) {
      const user = new User({
        email: 'john@example.com',
        password: 'securepassword123',
        name: 'John',
        surname: 'Doe',
        userType,
      });

      const error = user.validateSync();

      expect(error).toBeUndefined();
    }
  });

  it('applies default values correctly', () => {
    const user = new User({
      email: 'john@example.com',
      password: 'securepassword123',
      name: 'John',
      surname: 'Doe',
    });

    expect(user.removed).toBe(false);
    expect(user.enabled).toBe(true);
    expect(user.userType).toBe('user');
    expect(user.createdAt).toBeDefined();
  });

  it('lowercases and trims email', () => {
    const user = new User({
      email: '  JOHN@EXAMPLE.COM  ',
      password: 'securepassword123',
      name: 'John',
      surname: 'Doe',
    });

    expect(user.email).toBe('john@example.com');
  });

  it('accepts a valid user payload', () => {
    const user = new User({
      email: 'john@example.com',
      password: 'securepassword123',
      name: 'John',
      surname: 'Doe',
      userType: 'user',
      photo: 'https://example.com/photo.jpg',
    });

    const error = user.validateSync();

    expect(error).toBeUndefined();
  });

  it('generates a valid bcrypt hash', () => {
    const user = new User({
      email: 'john@example.com',
      password: 'securepassword123',
      name: 'John',
      surname: 'Doe',
    });

    const hash = user.generateHash('securepassword123');

    expect(hash).toBeDefined();
    expect(hash).not.toBe('securepassword123');
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
  });

  it('validates password correctly with validPassword', () => {
    const user = new User({
      email: 'john@example.com',
      name: 'John',
      surname: 'Doe',
    });

    user.password = user.generateHash('securepassword123');

    expect(user.validPassword('securepassword123')).toBe(true);
    expect(user.validPassword('wrongpassword')).toBe(false);
  });
});
