const http = require('http');
const { createTerminus, HealthCheckError } = require('@godaddy/terminus');
const app = require('./app');
const mongodb = require('./mongodb');
const check = require('./checks');

const { log } = console;
const { PORT } = process.env;

const server = http.createServer(app);

const run = async () => {
  // Start any services that need to connect before the server listens...
  // Generally speaking, connections should be wrapped with sane retries...
  const [mongoClient] = await Promise.all([
    mongodb,
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
          check.mongodb(mongoClient),
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
      await Promise.all([
        mongoClient.close().then(() => log('> MongoDB gracefully closed.')),
      ]);
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

// Run the app and immediately throw any startup errors.
run().catch(e => setImmediate(() => { throw e; }));
