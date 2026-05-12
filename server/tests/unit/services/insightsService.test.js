const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../../setup');

let insightsService;
let Employee;

beforeAll(async () => {
  await connect();
  insightsService = require('../../../src/services/insightsService');
  Employee = require('../../../src/models/Employee');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

const seedServiceData = async () => {
  await Employee.insertMany([
    { fullName: 'A', email: 'a@company.com', jobTitle: 'Dev', department: 'Eng', country: 'USA', salary: 100000, hireDate: new Date() },
    { fullName: 'B', email: 'b@company.com', jobTitle: 'Dev', department: 'Eng', country: 'USA', salary: 120000, hireDate: new Date() },
    { fullName: 'C', email: 'c@company.com', jobTitle: 'QA', department: 'Eng', country: 'Canada', salary: 80000, hireDate: new Date() },
  ]);
};

describe('Insights Service Layer', () => {
  it('should get salary by country', async () => {
    await seedServiceData();
    const result = await insightsService.getSalarySummaryByCountry();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('country');
    expect(result[0]).toHaveProperty('avgSalary');
  });

  it('should get salary by job title with optional country filter', async () => {
    await seedServiceData();
    const all = await insightsService.getSalarySummaryByJobTitle();
    expect(all.length).toBe(2); // Dev, QA

    const usaOnly = await insightsService.getSalarySummaryByJobTitle('USA');
    expect(usaOnly.length).toBe(1);
    expect(usaOnly[0].jobTitle).toBe('Dev');
  });

  it('should get department summary', async () => {
    await seedServiceData();
    const result = await insightsService.getDepartmentSummary();
    expect(result.length).toBe(1);
    expect(result[0].department).toBe('Eng');
  });

  it('should get salary distribution buckets', async () => {
    await seedServiceData();
    const result = await insightsService.getSalaryDistribution();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get headcount by country', async () => {
    await seedServiceData();
    const result = await insightsService.getHeadcountByCountry();
    expect(result.length).toBe(2);
  });
});
