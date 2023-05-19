require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');

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
