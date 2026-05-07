const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');
const Note = require('../src/models/Note');

describe('Notes API Endpoints', () => {
  let token;
  let noteId;

  before(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});

    // Create a user and get a token to use for note testing
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Note Tester',
      email: 'notetester@example.com',
      password: 'password123'
    });
    token = res.body.token;
  });

  it('should prevent unauthorized access to notes', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.statusCode).to.equal(401);
  });

  it('should create a new note for the authenticated user', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Note', content: 'This is test content' });

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property('title', 'Test Note');
    noteId = res.body._id; // Save the ID for later tests
  });

  it('should get all notes for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(1);
  });

  it('should update an existing note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('title', 'Updated Title');
  });

  it('should delete a note', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('id', noteId);
  });
});