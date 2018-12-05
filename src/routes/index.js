const mongodb = require('./mongodb');

module.exports = (app) => {
  app.use('/mongodb', mongodb);
};
