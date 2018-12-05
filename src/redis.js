const Redis = require('ioredis');

const { REDIS_URI } = process.env;
const { log } = console;

const redis = new Redis(REDIS_URI, {
  lazyConnect: true,
});

module.exports = redis.connect().then(() => {
  log('> Redis connected to', REDIS_URI);
  return redis;
});
