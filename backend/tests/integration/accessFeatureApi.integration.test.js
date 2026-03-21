const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.setTimeout(180000);

let mongoServer;
let app;
let User;
let AccessFeature;

const createLoggedInUser = async (userType = 'user', email = 'admin@example.com') => {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await User.create({
    name: 'Test',
    surname: 'Admin',
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

describe('Access Features CRUD API integration', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    process.env.NODE_ENV = 'test';
    process.env.DATABASE = mongoServer.getUri();
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.SECRET = 'test-secret';
    process.env.KEY = 'test-key';

    require('../../models/User');
    require('../../models/AccessFeatures');

    User = mongoose.model('User');
    AccessFeature = mongoose.model('AccessFeature');

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
    await AccessFeature.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/access-features', () => {
    it('returns all features without auth', async () => {
      const { token, user } = await createLoggedInUser();
      await AccessFeature.create({
        name: 'Tactile Paving',
        description: 'Textured ground indicators.',
        category: 'Visual',
        createdBy: user._id,
      });

      const response = await request(app).get('/api/access-features');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Tactile Paving');
    });

    it('returns only active features when activeOnly=true', async () => {
      const { token, user } = await createLoggedInUser();
      await AccessFeature.create({
        name: 'Active Feature',
        description: 'Active feature description.',
        isActive: true,
        createdBy: user._id,
      });
      await AccessFeature.create({
        name: 'Inactive Feature',
        description: 'Inactive feature description.',
        isActive: false,
        createdBy: user._id,
      });

      const response = await request(app).get('/api/access-features?activeOnly=true');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Active Feature');
    });
  });

  describe('GET /api/access-features/:id', () => {
    it('returns a single feature by id without auth', async () => {
      const { user } = await createLoggedInUser();
      const feature = await AccessFeature.create({
        name: 'Elevator Access',
        description: 'Elevator for mobility access.',
        category: 'Mobility',
        createdBy: user._id,
      });

      const response = await request(app).get(`/api/access-features/${feature._id.toString()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Elevator Access');
    });

    it('returns 404 for invalid id', async () => {
      const response = await request(app).get('/api/access-features/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/access-features', () => {
    it('blocks create when token is missing', async () => {
      const response = await request(app).post('/api/access-features').send({
        name: 'Braille Signage',
        description: 'Signage with braille.',
        category: 'Visual',
        is_active: true,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('creates feature with valid token', async () => {
      const { token } = await createLoggedInUser();

      const response = await request(app)
        .post('/api/access-features')
        .set('x-auth-token', token)
        .send({
          name: 'Tactile Paving',
          description:
            'Textured ground surface indicators to assist pedestrians who are visually impaired.',
          category: 'Visual',
          is_active: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Tactile Paving');
      expect(response.body.data.category).toBe('Visual');
      expect(response.body.data.isActive).toBe(true);
    });

    it('rejects duplicate name', async () => {
      const { token, user } = await createLoggedInUser();
      await AccessFeature.create({
        name: 'Existing Feature',
        description: 'Already exists.',
        category: 'Mobility',
        createdBy: user._id,
      });

      const response = await request(app)
        .post('/api/access-features')
        .set('x-auth-token', token)
        .send({
          name: 'Existing Feature',
          description: 'Duplicate name attempt.',
          category: 'Visual',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('PUT /api/access-features/:id', () => {
    it('blocks update when token is missing', async () => {
      const { user } = await createLoggedInUser();
      const feature = await AccessFeature.create({
        name: 'Original Name',
        description: 'Original description.',
        createdBy: user._id,
      });

      const response = await request(app)
        .put(`/api/access-features/${feature._id.toString()}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
    });

    it('updates feature with valid token', async () => {
      const { token, user } = await createLoggedInUser();
      const feature = await AccessFeature.create({
        name: 'Original Name',
        description: 'Original description.',
        category: 'Mobility',
        createdBy: user._id,
      });

      const response = await request(app)
        .put(`/api/access-features/${feature._id.toString()}`)
        .set('x-auth-token', token)
        .send({
          name: 'Updated Name',
          description: 'Updated description.',
          category: 'Visual',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.description).toBe('Updated description.');
      expect(response.body.data.category).toBe('Visual');
    });

    it('returns 404 for invalid id', async () => {
      const { token } = await createLoggedInUser();

      const response = await request(app)
        .put('/api/access-features/507f1f77bcf86cd799439011')
        .set('x-auth-token', token)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
    });

    it('rejects update to duplicate name', async () => {
      const { token, user } = await createLoggedInUser();
      await AccessFeature.create({
        name: 'Feature A',
        description: 'First feature.',
        createdBy: user._id,
      });
      const featureB = await AccessFeature.create({
        name: 'Feature B',
        description: 'Second feature.',
        createdBy: user._id,
      });

      const response = await request(app)
        .put(`/api/access-features/${featureB._id.toString()}`)
        .set('x-auth-token', token)
        .send({ name: 'Feature A' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('DELETE /api/access-features/:id', () => {
    it('blocks delete when token is missing', async () => {
      const { user } = await createLoggedInUser();
      const feature = await AccessFeature.create({
        name: 'To Delete',
        description: 'Feature to delete.',
        createdBy: user._id,
      });

      const response = await request(app).delete(`/api/access-features/${feature._id.toString()}`);

      expect(response.status).toBe(401);
    });

    it('permanently deletes feature from database', async () => {
      const { token, user } = await createLoggedInUser();
      const feature = await AccessFeature.create({
        name: 'Permanent Delete Test',
        description: 'Feature for permanent delete.',
        isActive: true,
        createdBy: user._id,
      });

      const response = await request(app)
        .delete(`/api/access-features/${feature._id.toString()}`)
        .set('x-auth-token', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const inDb = await AccessFeature.findById(feature._id);
      expect(inDb).toBeNull();
    });

    it('returns 404 for invalid id', async () => {
      const { token } = await createLoggedInUser();

      const response = await request(app)
        .delete('/api/access-features/507f1f77bcf86cd799439011')
        .set('x-auth-token', token);

      expect(response.status).toBe(404);
    });
  });
});
