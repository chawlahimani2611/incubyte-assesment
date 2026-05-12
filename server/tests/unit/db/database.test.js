const mongoose = require('mongoose');
const { connect, closeDatabase } = require('../../setup');

// Test the database connection utility itself
let connectToDatabase;

beforeAll(async () => {
  // We test the setup helper directly here
});

afterAll(async () => {
  // Cleanup any open connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe('Database Connection', () => {
  it('should connect to MongoDB successfully', async () => {
    await connect();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    await closeDatabase();
  });

  it('should have readyState 0 after closing', async () => {
    await connect();
    await closeDatabase();
    expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
  });
});
