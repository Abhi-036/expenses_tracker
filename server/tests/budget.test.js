
process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

require('./setup');

const request = require('supertest');
const app = require('../server');

async function registerAndLogin() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Budget Tester',
      email: 'budget@example.com',
      password: 'password123'
    });

  return res.body.token;
}

describe('Budgets API', () => {
  test('POST /api/budgets creates a budget and defaults endDate to end of month', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Food',
        limit: 300,
        startDate: '2026-08-01'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.limit).toBe(300);
    expect(res.body.data.endDate).toBeDefined();
  });

  test('GET /api/budgets returns computed spend/progress alongside each budget', async () => {
    const token = await registerAndLogin();

    await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Food',
        limit: 100,
        startDate: '2026-08-01',
        endDate: '2026-08-31'
      });

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'expense',
        amount: 90,
        category: 'Food',
        date: '2026-08-10'
      });

    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].spent).toBe(90);
    expect(res.body.data[0].status).toBe('warning');
  });
});
