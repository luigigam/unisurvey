const request = require('supertest');
const app = require('../../server'); 
const mongoose = require('mongoose');
const Admin = require('../models/admin');

describe('API per gli amministratori', () => {
  beforeAll(async () => {
    // Connettiti al database di test
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnettiti dal database di test e chiudi la connessione
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Cancella la collezione degli amministratori dopo ogni test
    await Admin.deleteMany({});
  });

  describe('POST /admins/signup', () => {
    test('dovrebbe registrare un nuovo amministratore', async () => {
      const response = await request(app)
        .post('/admins/signup')
        .send({
          name: 'John',
          surname: 'cile',
          email: 'john.cile@example.com',
          password: 'password',
        })
        .expect(201);

      expect(response.body.name).toBe('John');
      expect(response.body.surname).toBe('cile');
      expect(response.body.email).toBe('john.cile@example.com');
      expect(response.body.password).toBeDefined();
    });

    test('dovrebbe restituire un errore se l\'email è già in uso', async () => {
      // Crea un amministratore di esempio nel database
      await Admin.create({
        name: 'Existing',
        surname: 'Admin',
        email: 'existing.admin@example.com',
        password: 'password',
      });

      const response = await request(app)
        .post('/admins/signup')
        .send({
          name: 'John',
          surname: 'cile',
          email: 'existing.admin@example.com',
          password: 'password',
        })
        .expect(409);

      expect(response.body.message).toBe('email-already-in-use');
    });

    test('dovrebbe restituire un errore se l\'email non è valida', async () => {
      const response = await request(app)
        .post('/admins/signup')
        .send({
          name: 'John',
          surname: 'cile',
          email: 'invalid-email',
          password: 'password',
        })
        .expect(400);

      expect(response.body.state).toBe('invalid-email');
    });
  });

  describe('POST /admins/login', () => {
    test('dovrebbe effettuare l\'accesso di un amministratore esistente e restituire token JWT', async () => {
      // Crea un amministratore di esempio nel database
      await Admin.create({
        name: 'John',
        surname: 'cile',
        email: 'john.cile@example.com',
        password: 'password',
      });

      const response = await request(app)
        .post('/admins/login')
        .send({
          email: 'john.cile@example.com',
          password: 'password',
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    test('dovrebbe restituire un errore se l\'email non viene trovata', async () => {
      const response = await request(app)
        .post('/admins/login')
        .send({
          email: 'nonexistent.admin@example.com',
          password: 'password',
        })
        .expect(404);

      expect(response.text).toBe('Cannot find admin');
    });

    test('dovrebbe restituire un errore se la password è errata', async () => {
      // Crea un amministratore di esempio nel database
      await Admin.create({
        name: 'John',
        surname: 'cile',
        email: 'john.cile@example.com',
        password: 'password',
      });

      const response = await request(app)
        .post('/admins/login')
        .send({
          email: 'john.cile@example.com',
          password: 'wrong-password',
        })
        .expect(401);

      expect(response.text).toBe('Invalid password');
    });
  });

});
