const { Router } = require('express');
const asyncRoute = require('../utils/async-route');
const mongodb = require('../mongodb');

const router = Router();

const collection = () => mongodb.db('test').collection('docs');

router.get('/', asyncRoute(async (req, res) => {
  // Simulate a mongodb read.
  const coll = await collection();
  const docs = await coll.find({}).sort([['createdAt', -1]]).limit(10).toArray();
  res.json({
    total: await coll.countDocuments(),
    lastTen: docs,
  });
}));

router.get('/write', asyncRoute(async (req, res) => {
  // Simulate a mongodb read.
  const doc = { createdAt: new Date() };
  const r = await collection().insertOne(doc);
  res.json(r);
}));

module.exports = router;
