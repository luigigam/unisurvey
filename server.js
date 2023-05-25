require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { google } = require('googleapis');

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
            }
        ]
    },
    apis: ['./backend/routes/*js']
}

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCg+kDPLRbbLTe2\nLz7mdCab2eDxSSI3vB/DOZ/y3V5uALGeeiiaZb1dx7sOEpFqopQV2XlL7E4ViAe8\nAJB/HBWgycAd7kqXKfVAlU9OvuSGBK497DH5zVUDPky+7ffdIg+/x5AxCCppK+nW\njqIW7h3OuHQFu9tP4HZfY3eWL1t05eNTCujkAqiVru3blaZf48RdnS/7s94Rr4U4\nnkKuDYGGxK157ZHNPXyzfpsE8+qDWMfGzGAIhi+vYI2OyVG2hKj69Kc4BcebHwTE\n5wVwaQjbzqQ2Qe0msyaJ7veBgUnhzsiNgmlgmHBxzIEWNJOSJdjcoI7/C96M/HyF\n5R/5lFrVAgMBAAECggEAEpFS/OKTRpQkXy37aBsBIgxjSwl3uiyHkF3a8mkwvWj0\nk9Y8zTRLf5/sVj7ziXR3tr53JHf8+LRQShHZmOO9JebnczxbW6zCBmFCfM99bezn\nySoviIPz2JQsx4AMzTOi0+jZm6I4vBlN10rr7M+p3gB+F3Q343J9TNrc/hR3zNeR\ncHS0WdzugiZi6h5I5eyAGDRYFrhRZF1gMKPnAQMoqltDziv81aNhsXP2iket36UB\nUF8ae3+Q73z+IRfVHiKUJ/MxZfcZBi3wrvXkYleZafaE+dhNwKXAHwM5JEY352vx\nSzGcg+pb2cVxIlFgGx/wXqMR5ZPmovYIAXZYv6Ba+QKBgQDYRq0zQmH5uxOdrXv+\nb2szK5+IainoQsoXHKIW+fqzbBXIYF3etmXjByH8YBF+n3cEdTGfTP6pSFBMiEKI\njAY2vq+MSmZyO6wrsdimxNEA/ogaxi5+SVIlaqA43FY3cuGrtTUACSApY+joy8i8\naO1J8KZyXyL0rZYCMzB0FisG7QKBgQC+i28hq18W3rVAkVqnAmowxb2sEgu66M2N\niUZ50VhM1oWsvagVLV9fvAlPYaUcVkAy+nzP3fpMZakWGy1upvyEyvxKV+s1zPAd\nGxAV1X6wwD8QJMHjr7x3f+6WBfP1NfpFTS0sMjJCbVrzGfwAUyuwgW/wMA7WA9nk\nwUhWChl+iQKBgQDATRdznHLBOjYW3UqC0U7gEMmo4byhZ8GJC0yUYXEoV9KGeCj+\n/e9aDd2KKWFk1SVeMVYN7sgAfOvpIL8H6nkb9DDi7MRqjeRodZnNrvKnj6o1JEHy\nx/7ihgwwgrmmU9+UbWrSvUp7gvp1A71YyXMza2aUC0Npi272Rc2vaoaXgQKBgBRS\nruG6c4Pu8QoX9sFFYqodDSPjMNkYp4PnFls71t0rLErGV70af8eoOJ383i1tjZ9i\nVBmfpWislyJCd9ALg3duZwZO5klwuFOCZW7OvJqBhrhkE0IDpmhgfsQFkoWe4jiu\nCJlkKTQokcDIDrbCKDDFPXkyxwJQmtbpPpveq+VxAoGAYOYy7DvBQ3HMHclkRjdT\n0VUWCbP5waJcw+wxCaNcBjFZjJ8vw+F9qdL6EesSHnZZhbiuV79z8iKiEeSStfc6\nUqXOGIaDjAt1rgFrk+rvpL97DEjZRu9c0ESsLnJ3JesSsVcttPmvvGL7maO2CqBi\nOgv/8iRjcnbciWFOl24XHsA=\n-----END PRIVATE KEY-----"
const GOOGLE_CLIENT_EMAIL = "calendar-key@unisurvey-387811.iam.gserviceaccount.com"
const GOOGLE_PROJECT_NUMBER = "508271235294"
const GOOGLE_CALENDAR_ID = "4d30161fb001f9645072b63bf3095f88b6b9937d716ee7b4d4125b47b1809492@group.calendar.google.com"

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
    calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
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
      'summary': 'Primo Evento!',
      'location': 'Povo',
      'description': 'Primo evento aggiunto al calendario!',
      'start': {
        'dateTime': '2023-06-12T09:00:00-07:00'
      },
      'end': {
        'dateTime': '2023-07-14T17:00:00-07:00'
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
      calendar.events.insert({
        auth:a,
        calendarId: GOOGLE_CALENDAR_ID,
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

mainRouter.use('/students', studentsRouter);
mainRouter.use('/admins', adminsRouter);
mainRouter.use('/events', eventsRouter);

app.use(express.static('frontend'));

app.listen(3000, () => console.log('Server Started'));
