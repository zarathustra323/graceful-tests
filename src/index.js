const http = require('http');
const { createTerminus } = require('@godaddy/terminus');
const app = require('./app');

const { log } = console;
const { PORT } = process.env;

const server = http.createServer(app);

const run = async () => {
  createTerminus(server, {
    timeout: 1000,
    signals: ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGQUIT'],
    healthChecks: {
      /**
       * Reject/throw to indicate poor health, otherwise resolve to indicate healthy.
       * The resolve value will be included in the response.
       * Should check external services, like the db, redis, etc.
       */
      '/_health': async () => {
        throw new Error('Something bad');
      },
    },
    onSignal: async () => {
      log('> Cleaning up...');
      // Cleanup logic, like closing DB connections...
    },
    onShutdown: () => {
      log('> Cleanup finished. Shutting down.');
    },
  });

  // Start any services that need to connect before the server listens...
  // Generally speaking, connections should be wrapped with sane retries...
  await Promise.all([]);

  server.listen(80, () => {
    log(`> Ready on http://localhost:${PORT}`);
  });
};

// Simulate future NodeJS behavior by throwing unhandled Promise rejections.
process.on('unhandledRejection', (e) => {
  log('> Unhandled promise rejection. Throwing error...');
  throw e;
});

// Run the app and immediately throw any startup errors.
run().catch(e => setImmediate(() => { throw e; }));
