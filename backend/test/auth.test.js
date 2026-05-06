const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');

describe('Auth API Endpoints', () => {
  before(async () => {
    // Clear the users collection before running tests
    await User.deleteMany({});
  });

  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property('token');
    expect(res.body.email).to.equal(testUser.email);
  });

  it('should not register a user with an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.equal('User already exists');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('token');
  });
});