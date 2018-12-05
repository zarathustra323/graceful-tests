const express = require('express');
const { join } = require('path');
const routes = require('./routes');

const app = express();

const endpoint = (req, path) => `${req.protocol}://${join(req.get('host'), path)}`;

app.get('/', (req, res) => {
  res.json({
    mongodb: {
      read: endpoint(req, 'mongodb'),
      write: endpoint(req, 'mongodb/write'),
    },
  });
});

routes(app);

module.exports = app;
