const { google } = require('googleapis');
const config = require('./config');

// Crea un nuovo oggetto OAuth2Client
const oauth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  config.redirectUri
);

// Ottieni l'URL di autorizzazione
const scopes = ['https://www.googleapis.com/auth/calendar'];
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

// Ottieni il token di accesso e il refresh token
async function getAccessToken(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Imposta il token di accesso per l'autenticazione
function setAccessToken(token) {
  oauth2Client.setCredentials(token);
}

// Crea un nuovo evento nel calendario
async function createEvent(eventData) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  try {
    const event = await calendar.events.insert({
      calendarId: 'primary', // ID del calendario
    });
    return event.data;
  } catch (error) {
    console.error('Errore durante la creazione dell\'evento:', error);
    throw error;
  }
}

// Ottieni gli eventi dal calendario
async function getEvents() {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary', // ID del calendario
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = response.data.items;
    return events;
  } catch (error) {
    console.error('Errore durante la lettura degli eventi:', error);
    throw error;
  }
}

// Esegui l'autenticazione con il token di accesso
function authenticateWithAccessToken(accessToken) {
  oauth2Client.setCredentials({ access_token: accessToken });
}

module.exports = {
  authUrl,
  getAccessToken,
  setAccessToken,
  createEvent,
  getEvents,
  authenticateWithAccessToken,
};
