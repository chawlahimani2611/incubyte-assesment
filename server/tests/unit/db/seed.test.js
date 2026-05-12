const path = require('path');
const { connect, closeDatabase, clearDatabase } = require('../../setup');
const Employee = require('../../../src/models/Employee');

let seedDatabase;

beforeAll(async () => {
  await connect();
  // Require after connection setup
  seedDatabase = require('../../../src/db/seed');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Performant Database Seeding Script', () => {
  it('should seed exactly 10,000 records idempotently and efficiently', async () => {
    // Pre-seed a few documents to test idempotency (should clear existing data first)
    await Employee.create({
      fullName: 'Old Record',
      email: 'old@company.com',
      jobTitle: 'Legacy',
      department: 'Legacy',
      country: 'USA',
      salary: 50000,
      hireDate: new Date(),
    });

    const startTime = Date.now();

    // Run seed script
    const result = await seedDatabase({
      firstNamesPath: path.join(__dirname, '../../../data/first_names.txt'),
      lastNamesPath: path.join(__dirname, '../../../data/last_names.txt'),
      targetCount: 10000,
      batchSize: 5000,
      silent: true, // suppress console logs during test
    });

    const duration = Date.now() - startTime;

    // Assert successful return
    expect(result.success).toBe(true);
    expect(result.insertedCount).toBe(10000);

    // Verify database collection count is exactly 10,000 (proving idempotency)
    const count = await Employee.countDocuments();
    expect(count).toBe(10000);

    // Verify execution time is under 3 seconds (3000ms)
    expect(duration).toBeLessThan(3000);

    // Sample a record to verify valid data population
    const sample = await Employee.findOne();
    expect(sample).toBeDefined();
    expect(sample.fullName).toContain(' ');
    expect(sample.email).toContain('@company.com');
    expect(sample.salary).toBeGreaterThan(0);
    expect(sample.jobTitle).toBeDefined();
    expect(sample.department).toBeDefined();
    expect(sample.country).toBeDefined();
    expect(sample.hireDate).toBeDefined();
  });
});
