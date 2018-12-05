const Redis = require('ioredis');

const { REDIS_URI } = process.env;

module.exports = new Redis(REDIS_URI, {
  lazyConnect: true,
});
