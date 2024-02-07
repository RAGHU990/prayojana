const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./config/db');
const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase_config.json');
var cors = require('cors')

// create express app
const app = express();
app.use(cors())

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Setup server port
const port = 7000;
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse requests of content-type - application/json
app.use(bodyParser.json())
// define a root route
app.get('/rest', (req, res) => {
  res.send("Hello World");
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Routes Link

require("./app/routes/routes.js")(app);

// listen for requests
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
