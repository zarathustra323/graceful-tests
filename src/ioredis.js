const Redis = require('ioredis');

const { REDIS_URI } = process.env;

module.exports = new Redis(REDIS_URI, {
  lazyConnect: true,
  maxRetriesPerRequest: 5,
  connectTimeout: 200, // TCP Connection timeout setting (default 10000)
  retryStrategy: (times) => {
    // This will force redis to stop trying to reconnect.
    // With 15 tries, each waiting 500ms, ~7500ms. This should mimic mongodb.
    if (times > 15) return null;
    const delay = 500;
    return delay;
  },
});
