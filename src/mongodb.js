const { MongoClient } = require('mongodb');
const pkg = require('../package.json');

const { MONGO_URI } = process.env;

module.exports = new MongoClient(MONGO_URI, {
  appname: pkg.name,
  connectTimeoutMS: 200, // TCP Connection timeout setting (default 30000)
  useNewUrlParser: true,
  // Single server options. Has no effect on RS members?
  reconnectTries: 15, // Default 30
  reconnectInterval: 500, // Default 1000
  bufferMaxEntries: -1, // Default -1,
});
