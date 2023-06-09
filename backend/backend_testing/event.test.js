/*
const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from app.js
const Event = require('../models/event');

describe('Event Routes', () => {
  let event;

  beforeEach(async () => {
    // Create a sample event for testing
    event = new Event({
      summary: 'Test Event',
      location: 'Test Location',
      start: new Date(),
      end: new Date(),
      description: 'Test Description',
      isRegular: false,
    });
    await event.save();
  });

  afterEach(async () => {
    // Clean up the test data after each test
    await Event.deleteMany();
  });

  describe('GET /events/getevents', () => {
    it('should get all events', async () => {
      const res = await request(app).get('/events/getevents');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([event]); // Assuming the response is an array of events
    });

    it('should handle server errors', async () => {
      jest.spyOn(Event, 'find').mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/events/getevents');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Database error' });
    });
  });

  describe('GET /events/:id', () => {
    it('should get an event by id', async () => {
      const res = await request(app).get(`/events/${event._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(event);
    });

    it('should handle event not found', async () => {
      const nonExistentId = '60cda1298265e40a84e8a12b'; // A non-existent event id

      const res = await request(app).get(`/events/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Event not found' });
    });

    it('should handle server errors', async () => {
      jest.spyOn(Event, 'findById').mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get(`/events/${event._id}`);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Database error' });
    });
  });
});
*/