module.exports = {
  mongodb: async (client) => {
    const { ok } = await client.db('test').command({ ping: 1 });
    if (!ok) throw Error('MongoDB ping did not return ok.');
    return 'MongoDB pinged successfully.';
  },
  redis: client => client.ping().then(() => 'Redis pinged successfully.'),
};
