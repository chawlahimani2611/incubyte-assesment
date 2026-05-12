const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../../setup');
const Employee = require('../../../src/models/Employee');

// Repository will be implemented in Green phase
let insightsRepository;

beforeAll(async () => {
  await connect();
  insightsRepository = require('../../../src/repositories/insightsRepository');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

// Helper to seed analytics data
const seedAnalyticsData = async () => {
  const employees = [
    { fullName: 'Emp 1', email: 'emp1@company.com', jobTitle: 'Engineer', department: 'Engineering', country: 'USA', salary: 100000, hireDate: new Date() },
    { fullName: 'Emp 2', email: 'emp2@company.com', jobTitle: 'Engineer', department: 'Engineering', country: 'USA', salary: 120000, hireDate: new Date() },
    { fullName: 'Emp 3', email: 'emp3@company.com', jobTitle: 'Manager', department: 'Engineering', country: 'USA', salary: 150000, hireDate: new Date() },
    { fullName: 'Emp 4', email: 'emp4@company.com', jobTitle: 'Engineer', department: 'Engineering', country: 'Canada', salary: 90000, hireDate: new Date() },
    { fullName: 'Emp 5', email: 'emp5@company.com', jobTitle: 'Sales Rep', department: 'Sales', country: 'Canada', salary: 80000, hireDate: new Date() },
    { fullName: 'Emp 6', email: 'emp6@company.com', jobTitle: 'Sales Rep', department: 'Sales', country: 'UK', salary: 70000, hireDate: new Date() },
  ];

  await Employee.insertMany(employees);
};

describe('Insights Repository Aggregation Pipelines', () => {
  describe('Edge Cases: Empty Database', () => {
    it('should return empty arrays when no data exists', async () => {
      const byCountry = await insightsRepository.getSalaryByCountry();
      const byJobTitle = await insightsRepository.getSalaryByJobTitle();
      const deptSummary = await insightsRepository.getDepartmentSummary();
      const distribution = await insightsRepository.getSalaryDistribution();
      const headcount = await insightsRepository.getHeadcountByCountry();

      expect(byCountry).toEqual([]);
      expect(byJobTitle).toEqual([]);
      expect(deptSummary).toEqual([]);
      expect(distribution).toEqual([]);
      expect(headcount).toEqual([]);
    });
  });

  describe('getSalaryByCountry', () => {
    it('should return min, max, avg, and headcount per country', async () => {
      await seedAnalyticsData();

      const results = await insightsRepository.getSalaryByCountry();

      expect(results).toHaveLength(3); // USA, Canada, UK

      // Find USA
      const usa = results.find((r) => r.country === 'USA');
      expect(usa).toBeDefined();
      expect(usa.headcount).toBe(3);
      expect(usa.minSalary).toBe(100000);
      expect(usa.maxSalary).toBe(150000);
      expect(usa.avgSalary).toBeCloseTo((100000 + 120000 + 150000) / 3);

      // Find Canada
      const canada = results.find((r) => r.country === 'Canada');
      expect(canada).toBeDefined();
      expect(canada.headcount).toBe(2);
      expect(canada.minSalary).toBe(80000);
      expect(canada.maxSalary).toBe(90000);
      expect(canada.avgSalary).toBe(85000);
    });
  });

  describe('getSalaryByJobTitle', () => {
    it('should return avg salary and headcount per job title across all countries', async () => {
      await seedAnalyticsData();

      const results = await insightsRepository.getSalaryByJobTitle();

      expect(results.length).toBeGreaterThan(0);

      const engineer = results.find((r) => r.jobTitle === 'Engineer');
      expect(engineer).toBeDefined();
      expect(engineer.headcount).toBe(3); // 2 in USA, 1 in Canada
      expect(engineer.avgSalary).toBeCloseTo((100000 + 120000 + 90000) / 3);
    });

    it('should filter by country if provided', async () => {
      await seedAnalyticsData();

      const results = await insightsRepository.getSalaryByJobTitle('USA');

      expect(results.length).toBeGreaterThan(0);
      // Sales Rep is not in USA
      const salesRep = results.find((r) => r.jobTitle === 'Sales Rep');
      expect(salesRep).toBeUndefined();

      const engineer = results.find((r) => r.jobTitle === 'Engineer');
      expect(engineer.headcount).toBe(2);
      expect(engineer.avgSalary).toBe(110000);
    });
  });

  describe('getDepartmentSummary', () => {
    it('should return headcount and avg salary per department', async () => {
      await seedAnalyticsData();

      const results = await insightsRepository.getDepartmentSummary();

      expect(results).toHaveLength(2); // Engineering, Sales

      const eng = results.find((r) => r.department === 'Engineering');
      expect(eng.headcount).toBe(4);
      expect(eng.avgSalary).toBeCloseTo((100000 + 120000 + 150000 + 90000) / 4);

      const sales = results.find((r) => r.department === 'Sales');
      expect(sales.headcount).toBe(2);
      expect(sales.avgSalary).toBe(75000);
    });
  });

  describe('getSalaryDistribution', () => {
    it('should return histogram buckets for salary ranges', async () => {
      await seedAnalyticsData();

      const results = await insightsRepository.getSalaryDistribution();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Verify bucket shape
      results.forEach((bucket) => {
        expect(bucket.min).toBeDefined();
        expect(bucket.max).toBeDefined();
        expect(bucket.count).toBeDefined();
      });

      // Total count across all buckets should equal total documents (6)
      const totalCount = results.reduce((sum, b) => sum + b.count, 0);
      expect(totalCount).toBe(6);
    });
  });

  describe('getHeadcountByCountry', () => {
    it('should return headcount per country sorted descending', async () => {
      await seedAnalyticsData();

      const results = await insightsRepository.getHeadcountByCountry();

      expect(results).toHaveLength(3);
      expect(results[0].country).toBe('USA');
      expect(results[0].headcount).toBe(3);
      expect(results[1].country).toBe('Canada');
      expect(results[1].headcount).toBe(2);
      expect(results[2].country).toBe('UK');
      expect(results[2].headcount).toBe(1);
    });
  });
});
