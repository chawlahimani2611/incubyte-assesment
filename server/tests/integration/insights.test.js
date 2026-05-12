const request = require('supertest');
const { connect, closeDatabase, clearDatabase } = require('../setup');

let app;

beforeAll(async () => {
  await connect();
  app = require('../../src/app');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

// Helper to seed test data via API routes
const seedEmployeesForInsights = async () => {
  await request(app).post('/api/employees').send({
    fullName: 'Alice Dev',
    email: 'alice@company.com',
    jobTitle: 'Developer',
    department: 'Engineering',
    country: 'USA',
    salary: 100000,
    hireDate: '2023-01-01',
  });

  await request(app).post('/api/employees').send({
    fullName: 'Bob Dev',
    email: 'bob@company.com',
    jobTitle: 'Developer',
    department: 'Engineering',
    country: 'USA',
    salary: 120000,
    hireDate: '2023-01-01',
  });

  await request(app).post('/api/employees').send({
    fullName: 'Carol QA',
    email: 'carol@company.com',
    jobTitle: 'QA Engineer',
    department: 'Engineering',
    country: 'Canada',
    salary: 80000,
    hireDate: '2023-01-01',
  });
};

describe('Insights API Routes Integration Tests', () => {
  describe('GET /api/insights/salary-by-country', () => {
    it('should return salary metrics grouped by country (200)', async () => {
      await seedEmployeesForInsights();

      const response = await request(app)
        .get('/api/insights/salary-by-country')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const usa = response.body.data.find((item) => item.country === 'USA');
      expect(usa).toBeDefined();
      expect(usa.headcount).toBe(2);
      expect(usa.avgSalary).toBe(110000);
    });
  });

  describe('GET /api/insights/salary-by-job-title', () => {
    it('should return salary metrics grouped by job title (200)', async () => {
      await seedEmployeesForInsights();

      const response = await request(app)
        .get('/api/insights/salary-by-job-title')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const dev = response.body.data.find((item) => item.jobTitle === 'Developer');
      expect(dev).toBeDefined();
      expect(dev.headcount).toBe(2);
      expect(dev.avgSalary).toBe(110000);
    });

    it('should respect country query parameter filter', async () => {
      await seedEmployeesForInsights();

      const response = await request(app)
        .get('/api/insights/salary-by-job-title?country=Canada')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].jobTitle).toBe('QA Engineer');
    });
  });

  describe('GET /api/insights/departments', () => {
    it('should return metrics grouped by department (200)', async () => {
      await seedEmployeesForInsights();

      const response = await request(app)
        .get('/api/insights/departments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].department).toBe('Engineering');
      expect(response.body.data[0].headcount).toBe(3);
    });
  });

  describe('GET /api/insights/salary-distribution', () => {
    it('should return histogram buckets for salary distribution (200)', async () => {
      await seedEmployeesForInsights();

      const response = await request(app)
        .get('/api/insights/salary-distribution')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/insights/headcount-by-country', () => {
    it('should return headcount breakdown grouped by country (200)', async () => {
      await seedEmployeesForInsights();

      const response = await request(app)
        .get('/api/insights/headcount-by-country')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('country');
      expect(response.body.data[0]).toHaveProperty('headcount');
    });
  });
});
