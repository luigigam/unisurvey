/*
const request = require('supertest');
const app = require('../../server'); 
const Event = require('../models/event');

describe('Percorsi Evento', () => {
  let event;

  beforeEach(async () => {
    // Crea un evento di esempio per i test
    event = new Event({
      summary: 'Evento di prova',
      location: 'Località di prova',
      start: new Date(),
      end: new Date(),
      description: 'Descrizione di prova',
      isRegular: false,
    });
    await event.save();
  });

  afterEach(async () => {
    // Pulisci i dati di test dopo ogni test
    await Event.deleteMany();
  });

  describe('GET /events/getevents', () => {
    it('dovrebbe ottenere tutti gli eventi', async () => {
      const res = await request(app).get('/events/getevents');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([event]); // Presumendo che la risposta sia un array di eventi
    });

    it('dovrebbe gestire gli errori del server', async () => {
      jest.spyOn(Event, 'find').mockRejectedValueOnce(new Error('Errore del database'));

      const res = await request(app).get('/events/getevents');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Errore del database' });
    });
  });

  describe('GET /events/:id', () => {
    it('dovrebbe ottenere un evento per ID', async () => {
      const res = await request(app).get(`/events/${event._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(event);
    });

    it('dovrebbe gestire l\'evento non trovato', async () => {
      const nonExistentId = '60cda1298265e40a84e8a12b'; // Un ID di evento non esistente

      const res = await request(app).get(`/events/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Evento non trovato' });
    });

    it('dovrebbe gestire gli errori del server', async () => {
      jest.spyOn(Event, 'findById').mockRejectedValueOnce(new Error('Errore del database'));

      const res = await request(app).get(`/events/${event._id}`);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Errore del database' });
    });
  });
});

*/  