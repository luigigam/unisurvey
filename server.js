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
                name: 'booking',
                description: 'create and retrieve bookings'
            },
        ]
    },
    apis: ['./backend/routes/*js']
}

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

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