const http = require('http');
const { createTerminus, HealthCheckError } = require('@godaddy/terminus');
const pkg = require('../package.json');
const app = require('./app');
const mongodb = require('./mongodb');
const ioredis = require('./ioredis');

const { log } = console;
const { PORT } = process.env;

const server = http.createServer(app);

const boot = async () => {
  // // Redis events.
  ioredis.on('connect', () => {
    const { host, port, db } = ioredis.options;
    log('> Redis (ioredis) connected to', `redis://${host}:${port}/${db}`);
  });
  ioredis.on('close', () => log('> Redis (ioredis) connection closed.'));
  let totalReconTime = 0;
  // When the end event fires, Redis will no longer try to reconnect.
  // This should throw hard to force a restart of the entire application.
  ioredis.on('end', () => {
    log('> Redis (ioredis) will no longer reconnect.');
    throw new Error(`Redis will no longer attempt to reconnect. Retried for ${totalReconTime}ms`);
  });
  ioredis.on('reconnecting', (ms) => {
    totalReconTime += ms;
    log(`> Redis (ioredis) will attempt to reconnect in ${ms}ms`);
  });

  // Start any services that need to connect before the web server listens...
  // Generally speaking, connections should be wrapped with sane retries...
  await Promise.all([
    mongodb.connect().then((client) => {
      log('> MongoDB (mongodb) connected to', client.s.url);
      client.on('fullsetup', () => log('> MongoDB all servers connected.'));
      client.topology.on('left', data => log(`> A ${data} MongoDB server left the set.`));
      client.topology.on('joined', data => log(`> A ${data} MongoDB server joined the set.`));

      return client;
    }),
    ioredis.connect(),
  ]);

  const pingMongo = () => Promise.all([
    mongodb.db('test').command({ ping: 1 }),
    mongodb.db('test').collection('pings').updateOne({ _id: pkg.name }, { $set: { last: new Date() } }, { upsert: true, w: 1, wtimeout: 200 }),
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
          pingMongo().then(() => 'MongoDB (mongodb) pinged.'),
          ioredis.ping().then(() => 'Redis (ioredis) pinged.'),
        ].map(p => p.catch((err) => {
          errors.push(err);
        }))).then((res) => {
          if (errors.length) {
            log(errors);
            throw new HealthCheckError('Unhealthy', errors.map(e => e.message));
          }
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
