const { MongoClient } = require('mongodb');
const { name, version } = require('../package.json');

const { MONGO_URI } = process.env;

module.exports = new MongoClient(MONGO_URI, {
  appname: `${name} v${version}`,
  connectTimeoutMS: 200, // TCP Connection timeout setting (default 30000)
  useNewUrlParser: true,
  ignoreUndefined: true,
  readPreference: 'primaryPreferred',
  bufferMaxEntries: 0, // Default -1,
});
