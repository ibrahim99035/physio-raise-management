import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDb } from '../server/config/db.js';
import { User } from '../server/models/User.js';

let mongod;
let app;

async function loginAsAdmin(agent) {
  const existing = await User.findOne({ email: 'admin@test.local' }).setOptions({ includeArchived: true });
  if (!existing) {
    const passwordHash = await User.hashPassword('Admin123!');
    await User.create({
      name: 'Admin',
      email: 'admin@test.local',
      passwordHash,
      roles: ['admin']
    });
  }

  const loginRes = await agent.post('/api/auth/login').send({ email: 'admin@test.local', password: 'Admin123!' });
  assert.equal(loginRes.status, 200);
}

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.SESSION_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';

  await connectDb(process.env.MONGO_URI);
  const imported = await import('../server/app.js');
  app = imported.default;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

describe('API smoke', () => {
  it('returns health response', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
  });

  it('supports login and patient creation', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const createRes = await agent.post('/api/patients').send({
      name: 'Test Patient',
      phone: '+201555000000',
      age: 30,
      gender: 'male'
    });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.name, 'Test Patient');

    const listRes = await agent.get('/api/patients');
    assert.equal(listRes.status, 200);
    assert.equal(Array.isArray(listRes.body), true);
    assert.equal(listRes.body.length > 0, true);
  });

  it('returns monthly finance summary for admin', async () => {
    const agent = request.agent(app);
    await loginAsAdmin(agent);

    const expenseRes = await agent.post('/api/finance/expenses').send({
      title: 'Electricity',
      amount: 250,
      category: 'Utilities',
      date: new Date().toISOString(),
      notes: 'Test expense'
    });

    assert.equal(expenseRes.status, 201);

    const summaryRes = await agent.get('/api/finance/summary/monthly');
    assert.equal(summaryRes.status, 200);
    assert.equal(typeof summaryRes.body.revenue, 'number');
    assert.equal(typeof summaryRes.body.expenses, 'number');
    assert.equal(typeof summaryRes.body.profit, 'number');
  });
});
