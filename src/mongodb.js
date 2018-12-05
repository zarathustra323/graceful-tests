const { MongoClient } = require('mongodb');
const retry = require('p-retry');
const pkg = require('../package.json');

const { log } = console;
const { MONGO_URI } = process.env;

let promise;
const connect = async () => {
  if (!promise) {
    log('> Attempting to connect to MongoDB...');
    promise = MongoClient.connect(MONGO_URI, {
      appname: pkg.name,
      connectTimeoutMS: 200, // TCP Connection timeout setting (default 30000)
      useNewUrlParser: true,
      // Single server options. Has no effect on RS members?
      reconnectTries: 15, // Default 30
      reconnectInterval: 500, // Default 1000
      bufferMaxEntries: -1, // Default -1
    }).then((client) => {
      log('> MongoDB connected to', MONGO_URI);
      client.on('close', () => log('> MongoDB connection closed.'));
      client.on('reconnect', () => log('> MongoDB reconnected.'));
      client.on('reconnectFailed', () => log('> MongoDB gave up reconnecting. DB operations are dead.'));
      return client;
    });
  }
  const client = await promise;
  return client;
};

module.exports = retry(connect, {
  onFailedAttempt: (err) => {
    log(`> MongoDB connect attempt ${err.attemptNumber} failed. There are ${err.attemptsLeft} attempts left.`);
  },
  retries: 4,
  minTimeout: 200,
  maxTimeout: 1000,
});
