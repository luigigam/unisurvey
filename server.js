require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { google } = require('googleapis');
const googleConfig = require('./google-config.js');

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.json());

const studentsRouter = require('./backend/routes/students');
const adminsRouter = require('./backend/routes/admins');
const eventsRouter=require('./backend/routes/events');


app.use('/students', studentsRouter);
app.use('/admins', adminsRouter);
app.use('/events', eventsRouter);

app.use(express.static('frontend'));

const scopes = ['https://www.googleapis.com/auth/calendar'];

const oauth2Client = new google.auth.OAuth2(
  googleConfig.clientId,
  googleConfig.clientSecret,
  googleConfig.redirectUri
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

app.get('/auth/google', (req, res) => {
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.redirect('/');
});

app.get('/events', async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data } = await calendar.events.list({
      calendarId: 'primary', // ID del calendario desiderato
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    res.json(data.items);
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

app.listen(3000, () => console.log('Server Started'));
