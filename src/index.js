const http = require('http');
const { createTerminus, HealthCheckError } = require('@godaddy/terminus');
const app = require('./app');
const mongodb = require('./mongodb');
const ioredis = require('./ioredis');

const { log } = console;
const { PORT } = process.env;

const server = http.createServer(app);

const boot = async () => {
  // Start any services that need to connect before the web server listens...
  // Generally speaking, connections should be wrapped with sane retries...
  await Promise.all([
    mongodb.connect().then((client) => {
      log('> MongoDB (mongodb) connected to', client.s.url);
      return client;
    }),
    ioredis.connect().then(() => {
      const { host, port, db } = ioredis.options;
      log('> Redis (ioredis) connected to', `redis://${host}:${port}/${db}`);
    }),
  ]);

  createTerminus(server, {
    timeout: 1000, // Web server shutdown timeout (for keep-alive sockets, etc).
    signals: ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGQUIT'],
    healthChecks: {
      /**
       * Reject/throw to indicate poor health, otherwise resolve to indicate healthy.
       * The resolve value will be included in the response.
       * Should check external services, like the db, redis, etc.
       */
      '/_health': async () => {
        const errors = [];
        return Promise.all([
          mongodb.db('test').command({ ping: 1 }).then(() => 'MongoDB (mongodb) pinged.'),
          ioredis.ping().then(() => 'Redis (ioredis) pinged.'),
        ].map(p => p.catch((err) => {
          errors.push(err);
        }))).then((res) => {
          if (errors.length) throw new HealthCheckError('Unhealthy', errors);
          return res;
        });
      },
    },
    onSignal: async () => {
      log('> Cleaning up...');
      // Cleanup logic, like closing DB connections...
      try {
        await Promise.all([
          mongodb.close().then(() => log('> MongoDB (mongodb) gracefully closed.')),
          ioredis.quit().then(() => log('> Redis (ioredis) gracefully closed.')),
        ]);
      } catch (e) {
        log('> Cleanup ERRORED!', e);
        throw e;
      }
    },
    onShutdown: () => log('> Cleanup finished. Shutting down.'),
  });

  server.listen(80, () => {
    log(`> Ready on http://0.0.0.0:${PORT}`);
  });
};

// Simulate future NodeJS behavior by throwing unhandled Promise rejections.
process.on('unhandledRejection', (e) => {
  log('> Unhandled promise rejection. Throwing error...');
  throw e;
});

// Boot the app and immediately throw any startup errors.
boot().catch(e => setImmediate(() => { throw e; }));
