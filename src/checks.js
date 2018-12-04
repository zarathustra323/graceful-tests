module.exports = {
  mongodb: async (db) => {
    const { ok } = await db.command('ping');
    if (!ok) throw Error('MongoDB ping did not return ok.');
    return 'MongoDB successfully pinged.';
  },
};
