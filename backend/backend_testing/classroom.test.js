const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../../server.js');
const Classroom = require('../models/classroom');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

beforeAll(async () => {
  const uri = await mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await Classroom.remove({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

describe('GET /classrooms/getclassrooms', () => {
  it('dovrebbe restituire un elenco di aule', async () => {
    const classrooms = [
      { code: 'A1', seats: 30, available: true },
      { code: 'A2', seats: 50, available: true },
      { code: 'A3', seats: 20, available: false },
    ];

    for (let classroom of classrooms) {
      let newClassroom = new Classroom(classroom);
      await newClassroom.save();
    }

    const response = await supertest(app).get('/classrooms/getclassrooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);

    response.body.forEach((classroom, idx) => {
      expect(classroom.code).toBe(classrooms[idx].code);
      expect(classroom.seats).toBe(classrooms[idx].seats);
      expect(classroom.available).toBe(classrooms[idx].available);
    });
  });

  it('dovrebbe restituire un array vuoto se non ci sono aule', async () => {
    const response = await supertest(app).get('/classrooms/getclassrooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });
});