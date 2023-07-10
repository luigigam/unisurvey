require("dotenv").config();

const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

var calendar_constants = require("./backend/middlewares/calendar_constants");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const swaggerOptions = {
  openapi: "3.0.0",
  swaggerDefinition: {
    info: {
      title: "UniSurvey API",
      version: "1.0.0",
      license: {
        name: "GNU General Public License v3.0",
        url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
      },
      servers: [
        {
          url: `https://localhost:3000/`,
          description: "local server",
        },
      ],
      description:
        "UniSurvey is a REST API application made with Javascript on the server-side, and html and CSS and JavaScript on the client-side.",
    },
    basePath: "/api/",
    tags: [
      {
        name: "student",
        description: "user authentication, authorization and functions",
      },
      {
        name: "admin",
        description: "admin authentication, authorization and functions",
      },
      {
        name: "event",
        description: "add, retrieve and delete events",
      },
      {
        name: "classroom",
        description: "retrieve list of all classrooms",
      },
      {
        name: "survey",
        description: "retrieve list of all surveys",
      },
    ],
  },
  apis: ["./backend/routes/*js"],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

mongoose.connect(
  "mongodb+srv://luigigammino:gammino57tn@cluster0.lgs0mov.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(express.json());

const mainRouter = express.Router();
app.use("/api", mainRouter);

const studentsRouter = require("./backend/routes/students");
const adminsRouter = require("./backend/routes/admins");
const eventsRouter = require("./backend/routes/events");
const classroomsRouter = require("./backend/routes/classrooms");
const surveysRoutes = require("./backend/routes/surveys");

mainRouter.use("/students", studentsRouter);
mainRouter.use("/admins", adminsRouter);
mainRouter.use("/events", eventsRouter);
mainRouter.use("/classrooms", classroomsRouter);
mainRouter.use("/survey", surveysRoutes);

app.use("/", express.static("frontend"));

app.get("/", (req, res) => {
  calendar_constants.calendar.events.list(
    {
      calendarId: calendar_constants.GOOGLE_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    },
    (error, result) => {
      if (error) {
        res.send(JSON.stringify({ error: error }));
      } else {
        if (result.data.items.length) {
          console.log(result.data.items);
          res.send(JSON.stringify({ events: result.data.items }));
        } else {
          res.send(JSON.stringify({ message: "No upcoming events found." }));
        }
      }
    },
  );
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend/static/Loginpages"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
