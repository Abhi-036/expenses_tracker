process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

require('./setup');

const request = require('supertest');
const app = require('../server');

async function registerAndLogin() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Tx Tester',
      email: 'tx@example.com',
      password: 'password123'
    });

  return res.body.token;
}

describe('Transactions API', () => {
  test('POST /api/transactions creates a transaction for the authenticated user', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'expense',
        amount: 45.5,
        category: 'Food',
        date: '2026-08-01'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.amount).toBe(45.5);
    expect(res.body.data.category).toBe('Food');
  });

  test('POST /api/transactions rejects an invalid amount', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'expense',
        amount: -5,
        category: 'Food'
      });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/transactions requires authentication', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        type: 'expense',
        amount: 20,
        category: 'Food'
      });

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/transactions only returns the logged-in user transactions', async () => {
    const tokenA = await registerAndLogin();

    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User B',
        email: 'userb@example.com',
        password: 'password123'
      });

    const tokenB = resB.body.token;

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        type: 'expense',
        amount: 10,
        category: 'Food'
      });

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        type: 'expense',
        amount: 20,
        category: 'Shopping'
      });

    const listA = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(listA.body.data.length).toBe(1);
    expect(listA.body.data[0].amount).toBe(10);
  });

  test('DELETE /api/transactions/:id removes a transaction', async () => {
    const token = await registerAndLogin();

    const created = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'income',
        amount: 500,
        category: 'Salary'
      });

    const del = await request(app)
      .delete(`/api/transactions/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.statusCode).toBe(200);

    const get = await request(app)
      .get(`/api/transactions/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(get.statusCode).toBe(404);
  });
});

