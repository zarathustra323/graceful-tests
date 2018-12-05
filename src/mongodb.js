const { MongoClient } = require('mongodb');
const { name, version } = require('../package.json');

const { MONGO_URI } = process.env;

module.exports = new MongoClient(MONGO_URI, {
  appname: `${name} v${version}`,
  connectTimeoutMS: 200, // TCP Connection timeout setting (default 30000)
  useNewUrlParser: true,
  ignoreUndefined: true,
  // Single server options. Has no effect on RS members?
  reconnectTries: 15, // Default 30
  reconnectInterval: 500, // Default 1000
  bufferMaxEntries: -1, // Default -1,
});
