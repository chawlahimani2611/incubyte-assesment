const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  global.__MONGOD__ = instance;
  process.env.MONGODB_URI = uri;
};
