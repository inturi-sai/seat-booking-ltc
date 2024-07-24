const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;
const routes = require('./routes/routes');

app.use(bodyParser.json());

app.use(cors());

app.use(routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});