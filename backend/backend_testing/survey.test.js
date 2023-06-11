/*const request = require('supertest');
const app = require('../--server.js'); 

describe('Survey Routes', () => {
  // Test the POST /survey route
  describe('POST /survey', () => {
    it('should add a new survey', async () => {
      const response = await request(app)
        .post('/survey')
        .send({
          title: 'Mensa Povo0',
          link: 'https://docs.google.com/forms/d/e/1FAIpQLScxGZosjNqVlJEwBZmovJyFfM9sDEB68q0W-tzOudfgnB_bJA/viewform?usp=sf_link'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Sondaggio salvato nel database' });
    });

    it('should return an error when the survey data is invalid', async () => {
      const response = await request(app)
        .post('/survey')
        .send({
          // Invalid survey data without title and link properties
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Errore durante il salvataggio del sondaggio' });
    });
  });

  // Test the DELETE /survey/:id route
  describe('DELETE /survey/:id', () => {
    let surveyId;

    beforeAll(async () => {
      // Add a new survey before running the test
      const response = await request(app)
        .post('/survey')
        .send({
          title: 'Mensa Povo0',
          link: 'https://docs.google.com/forms/d/e/1FAIpQLScxGZosjNqVlJEwBZmovJyFfM9sDEB68q0W-tzOudfgnB_bJA/viewform?usp=sf_link'
        });

      surveyId = response.body.surveyId; // Assuming the API returns the ID of the created survey
    });

    it('should remove an existing survey', async () => {
      const response = await request(app).delete(`/survey/${surveyId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Sondaggio rimosso dal database' });
    });

    it('should return an error when the survey ID is invalid', async () => {
      const response = await request(app).delete('/survey/invalidId');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Errore durante la rimozione del sondaggio' });
    });
  });
});
*/