/*const request = require('supertest');
const app = require('../--server.js');
const mongoose = require('mongoose');
const Survey = require('../models/survey.js');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

beforeAll(async () => {
  const uri = await mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await Survey.remove({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

describe('GET /survey/getsurveys', () => {
  it('dovrebbe restituire un elenco di questionari', async () => {
    const surveys = [
      { title: 'Mensa Povo0', link: 'https://docs.google.com/forms/d/e/1FAIpQLScxGZosjNqVlJEwBZmovJyFfM9sDEB68q0W-tzOudfgnB_bJA/viewform?usp=sf_link' },
      { title: 'Mensa Povo1', link: 'https://docs.google.com/forms/d/e/1FAIpQLSeBaET1CZJmvnnG2KVQwpQ340MTBh1GsqC7wg3VxbWM2O7ZUw/viewform?usp=sf_link' },
      { title: 'Bibioteca BUP', link: 'https://docs.google.com/forms/d/e/1FAIpQLSc0D5pY2BCDu6SwdYCmBC43bXI1VZ7VVYy4ZUVZK34IgrjpHA/viewform?usp=sf_link' },
      { title: 'Parcheggi collina', link: 'https://docs.google.com/forms/d/e/1FAIpQLSevxrhfDKN9c_PWIERPtrZX4-R-u_yeVu6MEw0bSkZUC8b6hg/viewform?usp=sf_link' },
    ];

    for (let survey of surveys) {
      let newSurvey = new Survey(survey);
      await newSurvey.save();
    }

    const response = await supertest(app).get('/surveys/getsurveys');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    response.body.forEach((survey, idx) => {
      expect(survey.title).toBe(surveys[idx].title);
      expect(survey.link).toBe(surveys[idx].link);
    });
  });

  it('dovrebbe restituire un array vuoto se non ci sono survey', async () => {
    const response = await supertest(app).get('/surveys/getsurveys');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });
});
*/
