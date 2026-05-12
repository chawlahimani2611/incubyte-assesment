const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../../setup');
const Employee = require('../../../src/models/Employee');

// The repository does not exist yet — TDD Red phase
let employeeRepository;

beforeAll(async () => {
  await connect();
  employeeRepository = require('../../../src/repositories/employeeRepository');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

// Helper to create a valid employee data object
const createEmployeeData = (overrides = {}) => ({
  fullName: 'John Smith',
  email: 'john.smith@company.com',
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  country: 'United States',
  salary: 95000,
  currency: 'USD',
  hireDate: new Date('2023-01-15'),
  ...overrides,
});

describe('Employee Repository', () => {
  // ─── CREATE ───────────────────────────────────────────────
  describe('create', () => {
    it('should create an employee and return it with _id', async () => {
      const data = createEmployeeData();
      const result = await employeeRepository.create(data);

      expect(result._id).toBeDefined();
      expect(result.fullName).toBe('John Smith');
      expect(result.email).toBe('john.smith@company.com');
      expect(result.jobTitle).toBe('Software Engineer');
      expect(result.department).toBe('Engineering');
      expect(result.country).toBe('United States');
      expect(result.salary).toBe(95000);
      expect(result.currency).toBe('USD');
      expect(result.hireDate).toEqual(new Date('2023-01-15'));
    });

    it('should persist the employee in the database', async () => {
      const data = createEmployeeData();
      const created = await employeeRepository.create(data);

      const found = await Employee.findById(created._id);
      expect(found).not.toBeNull();
      expect(found.fullName).toBe('John Smith');
    });

    it('should throw on duplicate email', async () => {
      const data = createEmployeeData();
      await employeeRepository.create(data);

      const duplicate = createEmployeeData({ fullName: 'Jane Doe' });
      await expect(employeeRepository.create(duplicate)).rejects.toThrow();
    });
  });

  // ─── FIND BY ID ───────────────────────────────────────────
  describe('findById', () => {
    it('should return the employee when found', async () => {
      const data = createEmployeeData();
      const created = await employeeRepository.create(data);

      const found = await employeeRepository.findById(created._id);
      expect(found).not.toBeNull();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.fullName).toBe('John Smith');
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const found = await employeeRepository.findById(fakeId);

      expect(found).toBeNull();
    });

    it('should return null for invalid id format', async () => {
      const found = await employeeRepository.findById('invalid-id');

      expect(found).toBeNull();
    });
  });

  // ─── FIND ALL ─────────────────────────────────────────────
  describe('findAll', () => {
    // Seed multiple employees for pagination/filter tests
    const seedEmployees = async () => {
      const employees = [
        createEmployeeData({ fullName: 'Alice Johnson', email: 'alice@company.com', country: 'United States', jobTitle: 'Software Engineer', department: 'Engineering', salary: 90000 }),
        createEmployeeData({ fullName: 'Bob Williams', email: 'bob@company.com', country: 'United Kingdom', jobTitle: 'Product Manager', department: 'Product', salary: 85000 }),
        createEmployeeData({ fullName: 'Carol Davis', email: 'carol@company.com', country: 'United States', jobTitle: 'Data Analyst', department: 'Engineering', salary: 75000 }),
        createEmployeeData({ fullName: 'David Brown', email: 'david@company.com', country: 'India', jobTitle: 'Software Engineer', department: 'Engineering', salary: 45000 }),
        createEmployeeData({ fullName: 'Eve Wilson', email: 'eve@company.com', country: 'United Kingdom', jobTitle: 'Designer', department: 'Design', salary: 70000 }),
      ];

      for (const emp of employees) {
        await employeeRepository.create(emp);
      }
    };

    it('should return paginated results with default pagination', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({});

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should respect page and limit parameters', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('should return second page correctly', async () => {
      await seedEmployees();

      const page1 = await employeeRepository.findAll({ page: 1, limit: 2 });
      const page2 = await employeeRepository.findAll({ page: 2, limit: 2 });

      expect(page2.data).toHaveLength(2);
      expect(page2.page).toBe(2);
      // Ensure different records on different pages
      const page1Ids = page1.data.map((e) => e._id.toString());
      const page2Ids = page2.data.map((e) => e._id.toString());
      expect(page1Ids).not.toEqual(page2Ids);
    });

    it('should filter by country', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ country: 'United States' });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      result.data.forEach((emp) => {
        expect(emp.country).toBe('United States');
      });
    });

    it('should filter by jobTitle', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ jobTitle: 'Software Engineer' });

      expect(result.data).toHaveLength(2);
      result.data.forEach((emp) => {
        expect(emp.jobTitle).toBe('Software Engineer');
      });
    });

    it('should filter by department', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ department: 'Engineering' });

      expect(result.data).toHaveLength(3);
      result.data.forEach((emp) => {
        expect(emp.department).toBe('Engineering');
      });
    });

    it('should search by fullName (case-insensitive)', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ search: 'alice' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].fullName).toBe('Alice Johnson');
    });

    it('should search by email', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ search: 'bob@' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].fullName).toBe('Bob Williams');
    });

    it('should sort by salary ascending', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ sortBy: 'salary', sortOrder: 'asc' });

      const salaries = result.data.map((e) => e.salary);
      expect(salaries).toEqual([...salaries].sort((a, b) => a - b));
    });

    it('should sort by salary descending', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ sortBy: 'salary', sortOrder: 'desc' });

      const salaries = result.data.map((e) => e.salary);
      expect(salaries).toEqual([...salaries].sort((a, b) => b - a));
    });

    it('should return empty results when no match', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({ country: 'Antarctica' });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should combine multiple filters', async () => {
      await seedEmployees();

      const result = await employeeRepository.findAll({
        country: 'United States',
        department: 'Engineering',
      });

      expect(result.data).toHaveLength(2);
    });
  });

  // ─── UPDATE ───────────────────────────────────────────────
  describe('update', () => {
    it('should update and return the modified employee', async () => {
      const created = await employeeRepository.create(createEmployeeData());

      const updated = await employeeRepository.update(created._id, {
        salary: 110000,
        jobTitle: 'Senior Software Engineer',
      });

      expect(updated).not.toBeNull();
      expect(updated.salary).toBe(110000);
      expect(updated.jobTitle).toBe('Senior Software Engineer');
      // Unchanged fields should remain
      expect(updated.fullName).toBe('John Smith');
      expect(updated.country).toBe('United States');
    });

    it('should update the updatedAt timestamp', async () => {
      const created = await employeeRepository.create(createEmployeeData());
      const originalUpdatedAt = created.updatedAt;

      // Small delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 50));

      const updated = await employeeRepository.update(created._id, { salary: 100000 });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updated = await employeeRepository.update(fakeId, { salary: 100000 });

      expect(updated).toBeNull();
    });

    it('should return null for invalid id format', async () => {
      const updated = await employeeRepository.update('invalid-id', { salary: 100000 });

      expect(updated).toBeNull();
    });
  });

  // ─── DELETE ───────────────────────────────────────────────
  describe('delete', () => {
    it('should delete the employee and return true', async () => {
      const created = await employeeRepository.create(createEmployeeData());

      const result = await employeeRepository.delete(created._id);

      expect(result).toBe(true);

      // Verify it's actually deleted
      const found = await Employee.findById(created._id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await employeeRepository.delete(fakeId);

      expect(result).toBe(false);
    });

    it('should return false for invalid id format', async () => {
      const result = await employeeRepository.delete('invalid-id');

      expect(result).toBe(false);
    });
  });
});
