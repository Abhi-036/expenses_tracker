process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

require('./setup');

const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  test('POST /api/auth/register creates a user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.password).toBeUndefined();
  });

  test('POST /api/auth/register rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register rejects a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        ...validUser,
        password: '123'
      });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/login succeeds with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login fails with wrong password', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me requires a valid token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me returns the profile for a valid token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const token = registerRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });
});

