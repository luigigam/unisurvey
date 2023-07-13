require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

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
      {
        name: "reservation",
        description: "retrieve list of all reservation",
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
  }
);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = user;
    next();
  });
}

const mainRouter = express.Router();
app.use("/api", mainRouter);

const studentsRouter = require("./backend/routes/students");
const adminsRouter = require("./backend/routes/admins");
const eventsRouter = require("./backend/routes/events");
const classroomsRouter = require("./backend/routes/classrooms");
const surveysRoutes = require("./backend/routes/surveys");

mainRouter.use("/students", authenticateToken, studentsRouter);
mainRouter.use("/admins", authenticateToken, adminsRouter);
mainRouter.use("/events", authenticateToken, eventsRouter);
mainRouter.use("/classrooms", authenticateToken, classroomsRouter);
mainRouter.use("/survey", authenticateToken, surveysRoutes);

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
    }
  );
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend/static/Loginpages"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Generazione del diagramma ad albero delle pagine HTML

function generateHTMLTree(folderPath, parentPath = '') {
  const files = fs.readdirSync(folderPath);
  const htmlFiles = [];
  const subFolders = [];

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && path.extname(file).toLowerCase() === ".html") {
      htmlFiles.push(file);
    }

    if (stats.isDirectory()) {
      subFolders.push(file);
    }
  });

  if (htmlFiles.length === 0 && subFolders.length === 0) {
    return "";
  }

  let htmlTree = "<ul>";

  htmlFiles.forEach((file) => {
    const fileName = file === "index.html" ? "index.html" : file;
    const linkPath = path.join(parentPath, fileName).replace(/\\/g, '/');
    htmlTree += "<li>";
    htmlTree += `<a href="${linkPath}">${file}</a>`;
    htmlTree += "</li>";
  });

  subFolders.forEach((folder) => {
    const subFolderPath = path.join(folderPath, folder);
    const subTree = generateHTMLTree(subFolderPath, path.join(parentPath, folder));
    if (subTree !== "") {
      htmlTree += `<li><span class="folder">${folder}</span>${subTree}</li>`;
    }
  });

  htmlTree += "</ul>";

  return htmlTree;
}

function generateDiagram() {
  const frontendPath = path.join(__dirname, "frontend");
  const htmlTree = generateHTMLTree(frontendPath);

  const diagramHTML = `
    <html>
    <head>
      <title>HTML Tree Diagram</title>
      <link rel="stylesheet" type="text/css" href="style.css">
    </head>
    <body>
      <h1>HTML Tree Diagram</h1>
      ${htmlTree}
    </body>
    </html>
  `;

  const styleCSS = `
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    
    h1 {
      text-align: center;
    }
    
    ul {
      list-style-type: none;
      padding-left: 20px;
    }
    
    li {
      margin-bottom: 10px;
      position: relative;
      padding: 10px;
      border: 1px solid #999;
      background-color: #f2f2f2;
    }
    
    li:before {
      content: "";
      position: absolute;
      top: 0;
      left: -10px;
      border-left: 2px solid #999;
      height: 100%;
    }
    
    a {
      color: #333;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .folder {
      font-weight: bold;
    }
  `;

  fs.writeFileSync(path.join(frontendPath, "index.html"), diagramHTML);
  fs.writeFileSync(path.join(frontendPath, "style.css"), styleCSS);
}

generateDiagram();