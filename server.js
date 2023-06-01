require('dotenv').config();

const path = require('path');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const { google } = require('googleapis');
var calendar_constants = require('./backend/middlewares/calendar_constants');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const swaggerOptions = {
    openapi: '3.0.0',
    swaggerDefinition: {
        info: {
            title: 'UniSurvey API',
            version: '1.0.0',
            license: {
                name: 'GNU General Public License v3.0',
                url: 'https://www.gnu.org/licenses/gpl-3.0.en.html'
            },
            servers: [
                {
                    url: `https://localhost:3000/`,
                    description: 'local server'
                }
            ],
            description: 'UniSurvey is a REST API application made with Javascript on the server-side, and html and CSS on the client-side.'
        },
        basePath: '/api/',
        tags: [
            {
                name: 'student',
                description: 'user authentication, authorization and functions'
            },
            {
                name: 'admin',
                description: 'admin authentication, authorization and functions'
            },
            {
                name: 'events',
                description: 'add, retrieve and delete events'
            },
            {
                name: 'classrooms',
                description: 'add, retrieve and delete classrooms'
            },
            {
                name: 'bookings',
                description: 'create and retrieve bookings'
            },
        ]
    },
    apis: ['./backend/routes/*js']
}

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\n${process.env.GOOGLE_PRIVATE_KEY}\n-----END PRIVATE KEY-----`;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const jwtClient = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    SCOPES
);
  
const calendar = google.calendar({
    version: 'v3',
    project: GOOGLE_PROJECT_NUMBER,
    auth: jwtClient
});

app.get('/', (req, res) => {
    calendar_constants.calendar.events.list({
      calendarId: calendar_constants.GOOGLE_CALENDAR_ID,
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (error, result) => {
      if (error) {
        res.send(JSON.stringify({ error: error }));
      } else {
        if (result.data.items.length) {
          res.send(JSON.stringify({ events: result.data.items }));
        } else {
          res.send(JSON.stringify({ message: 'No upcoming events found.' }));
        }
      }
    });
  });

app.get("/createEvent",(req,res)=>{
    var event = {
      'summary': 'Evento Test!',
      'location': 'Povo',
      'description': 'Test evento aggiunto al calendario!',
      'start': {
        'dateTime': '2023-07-12T09:00:00-07:00'
      },
      'end': {
        'dateTime': '2023-07-12T17:00:00-07:00'
      },
      'attendees': [],
      'reminders': {
        'useDefault': false,
        'overrides': [
          {'method': 'email', 'minutes': 24 * 60},
          {'method': 'popup', 'minutes': 10},
        ],
      },
    };
      
    const auth = new google.auth.GoogleAuth({
      keyFile: './google-calendar-key-path.json',
      scopes: 'https://www.googleapis.com/auth/calendar',
    });
    auth.getClient().then(a=>{
      calendar_constants.calendar.events.insert({
        auth:a,
        calendarId: calendar_constants.GOOGLE_CALENDAR_ID,
        resource: event,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.data);
        res.jsonp("Event successfully created!");
      });
    })
})

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.json());

const mainRouter = express.Router()
app.use('/api', mainRouter)

const studentsRouter = require('./backend/routes/students');
const adminsRouter = require('./backend/routes/admins');
const eventsRouter = require('./backend/routes/events');
const bookingsRouter = require('./backend/routes/bookings');
const classroomsRouter = require('./backend/routes/classrooms');


mainRouter.use('/students', studentsRouter);
mainRouter.use('/admins', adminsRouter);
mainRouter.use('/events', eventsRouter);
mainRouter.use('/bookings', bookingsRouter);
mainRouter.use('/classrooms', classroomsRouter);

app.use('/', express.static('frontend'));

app.get('/login', (req, res)=>{
  res.sendFile(path.join(__dirname, './frontend/static/Loginpages/login.html'));
});

const Student = require('./backend/models/student');
const validateEmail = require('./backend/middlewares/validateEmail');
const hashing = require('./backend/middlewares/encrypt_pssw');

app.post('/api/students/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se l'email esiste nel database
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Verifica se la password è corretta
    const isPasswordCorrect = await bcrypt.compare(password, student.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    // Accesso consentito, restituisci una risposta di successo
    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    // Errore del server durante la verifica
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/aule', (req, res) => {
  Classroom.find({}, (err, aule) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(aule);
    }
  });
});


app.listen(3000, () => console.log('Server Started'));