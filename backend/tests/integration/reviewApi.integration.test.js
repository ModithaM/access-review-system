const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.setTimeout(180000);

let mongoServer;
let app;
let User;
let PublicSpace;
let AccessibilityReview;

const createLoggedInUser = async (userType = 'user', email = 'user1@example.com') => {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await User.create({
    name: 'Test',
    surname: 'User',
    email,
    password: passwordHash,
    userType,
    isLoggedIn: true,
  });

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      id: user._id,
      userType: user.userType,
    },
    process.env.JWT_SECRET,
  );

  return { user, token };
};

describe('Review API integration', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    process.env.NODE_ENV = 'test';
    process.env.DATABASE = mongoServer.getUri();
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.SECRET = 'test-secret';
    process.env.KEY = 'test-key';

    require('../../models/User');
    require('../../models/PublicSpace');
    require('../../models/AccessibilityReview');

    User = mongoose.model('User');
    PublicSpace = mongoose.model('PublicSpace');
    AccessibilityReview = mongoose.model('AccessibilityReview');

    app = require('../../app');

    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }

    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await AccessibilityReview.deleteMany({});
    await PublicSpace.deleteMany({});
    await User.deleteMany({});
  });

  it('blocks create review when token is missing', async () => {
    const publicSpace = await PublicSpace.create({
      name: 'City Library',
      category: 'Other',
      locationDetails: {
        address: 'Main Street',
        coordinates: { lat: 6.9271, lng: 79.8612 },
      },
      description: 'Accessible library.',
    });

    const response = await request(app).post('/api/review/create').send({
      spaceId: publicSpace._id.toString(),
      rating: 4,
      comment: 'This place has good wheelchair access and clear signs everywhere.',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('creates review for an authenticated user', async () => {
    const { token } = await createLoggedInUser();

    const publicSpace = await PublicSpace.create({
      name: 'Town Hall',
      category: 'Other',
      locationDetails: {
        address: 'Hall Road',
        coordinates: { lat: 6.901, lng: 79.85 },
      },
      description: 'Town hall with access features.',
    });

    const response = await request(app).post('/api/review/create').set('x-auth-token', token).send({
      spaceId: publicSpace._id.toString(),
      rating: 5,
      comment: 'Very good accessibility with ramps, elevators, and tactile indicators.',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.result.spaceId._id).toBe(publicSpace._id.toString());
  });

  it('prevents duplicate active review for same user and space', async () => {
    const { token, user } = await createLoggedInUser('user', 'dupe@example.com');

    const publicSpace = await PublicSpace.create({
      name: 'Bus Terminal',
      category: 'Station',
      locationDetails: {
        address: 'Terminal Avenue',
        coordinates: { lat: 6.9, lng: 79.9 },
      },
      description: 'Terminal with limited accessibility.',
    });

    await AccessibilityReview.create({
      spaceId: publicSpace._id,
      userId: user._id,
      rating: 3,
      comment: 'The terminal has mixed accessibility quality but can be improved significantly.',
    });

    const response = await request(app).post('/api/review/create').set('x-auth-token', token).send({
      spaceId: publicSpace._id.toString(),
      rating: 4,
      comment: 'Attempting to add duplicate active review for the same place and user.',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('forbids review update by non-owner', async () => {
    const owner = await createLoggedInUser('user', 'owner@example.com');
    const intruder = await createLoggedInUser('user', 'intruder@example.com');

    const publicSpace = await PublicSpace.create({
      name: 'Community Park',
      category: 'Park',
      locationDetails: {
        address: 'Park Lane',
        coordinates: { lat: 6.93, lng: 79.86 },
      },
      description: 'Park with pathways.',
    });

    const review = await AccessibilityReview.create({
      spaceId: publicSpace._id,
      userId: owner.user._id,
      rating: 4,
      comment: 'Pathways are mostly accessible and maintained for wheelchair users.',
    });

    const response = await request(app)
      .patch(`/api/review/update/${review._id.toString()}`)
      .set('x-auth-token', intruder.token)
      .send({ rating: 2, comment: 'Trying unauthorized update attempt from different user.' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('allows admin to delete someone else review', async () => {
    const owner = await createLoggedInUser('user', 'deleteowner@example.com');
    const admin = await createLoggedInUser('admin', 'admin@example.com');

    const publicSpace = await PublicSpace.create({
      name: 'Central Hospital',
      category: 'Hospital',
      locationDetails: {
        address: 'Health Street',
        coordinates: { lat: 6.91, lng: 79.88 },
      },
      description: 'Hospital environment.',
    });

    const review = await AccessibilityReview.create({
      spaceId: publicSpace._id,
      userId: owner.user._id,
      rating: 4,
      comment: 'Hospital has accessible entry points and dedicated assistance services.',
    });

    const response = await request(app)
      .delete(`/api/review/delete/${review._id.toString()}`)
      .set('x-auth-token', admin.token);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.result.removed).toBe(true);
  });

  it('validates invalid rating filter in list endpoint', async () => {
    const response = await request(app).get('/api/review/list?minRating=9');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
