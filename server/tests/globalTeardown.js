module.exports = async function globalTeardown() {
  const instance = global.__MONGOD__;
  if (instance) {
    await instance.stop();
  }
};
