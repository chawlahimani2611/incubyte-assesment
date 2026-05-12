const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../../setup');
const { ValidationError, NotFoundError, ConflictError } = require('../../../src/utils/errors');

// The service does not exist yet — TDD Red phase
let employeeService;

beforeAll(async () => {
  await connect();
  employeeService = require('../../../src/services/employeeService');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

// Helper to create valid employee input
const validInput = (overrides = {}) => ({
  fullName: 'John Smith',
  email: 'john.smith@company.com',
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  country: 'United States',
  salary: 95000,
  currency: 'USD',
  hireDate: '2023-01-15',
  ...overrides,
});

describe('Employee Service', () => {
  // ─── CREATE ───────────────────────────────────────────────
  describe('createEmployee', () => {
    it('should create an employee with valid data', async () => {
      const result = await employeeService.createEmployee(validInput());

      expect(result._id).toBeDefined();
      expect(result.fullName).toBe('John Smith');
      expect(result.email).toBe('john.smith@company.com');
      expect(result.salary).toBe(95000);
    });

    it('should auto-generate email from fullName if email not provided', async () => {
      const input = validInput({ fullName: 'Jane Doe' });
      delete input.email;

      const result = await employeeService.createEmployee(input);

      expect(result.email).toBe('jane.doe@company.com');
    });

    it('should handle email generation with special characters in name', async () => {
      const input = validInput({ fullName: "Mary O'Brien" });
      delete input.email;

      const result = await employeeService.createEmployee(input);

      expect(result.email).toMatch(/^mary/);
      expect(result.email).toContain('@company.com');
    });

    it('should throw ValidationError when fullName is missing', async () => {
      const input = validInput();
      delete input.fullName;

      await expect(employeeService.createEmployee(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when salary is negative', async () => {
      const input = validInput({ salary: -5000 });

      await expect(employeeService.createEmployee(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when salary is zero', async () => {
      const input = validInput({ salary: 0 });

      await expect(employeeService.createEmployee(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when salary is not a number', async () => {
      const input = validInput({ salary: 'not-a-number' });

      await expect(employeeService.createEmployee(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when jobTitle is missing', async () => {
      const input = validInput();
      delete input.jobTitle;

      await expect(employeeService.createEmployee(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when country is missing', async () => {
      const input = validInput();
      delete input.country;

      await expect(employeeService.createEmployee(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when department is missing', async () => {
      const input = validInput();
      delete input.department;

      await expect(employeeService.createEmployee(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when hireDate is missing', async () => {
      const input = validInput();
      delete input.hireDate;

      await expect(employeeService.createEmployee(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError with field-level errors', async () => {
      const input = {};

      try {
        await employeeService.createEmployee(input);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });

    it('should throw ConflictError on duplicate email', async () => {
      await employeeService.createEmployee(validInput());

      const duplicate = validInput({ fullName: 'Jane Smith' });

      await expect(employeeService.createEmployee(duplicate)).rejects.toThrow(ConflictError);
    });
  });

  // ─── GET BY ID ────────────────────────────────────────────
  describe('getEmployeeById', () => {
    it('should return the employee when found', async () => {
      const created = await employeeService.createEmployee(validInput());

      const result = await employeeService.getEmployeeById(created._id);

      expect(result).not.toBeNull();
      expect(result.fullName).toBe('John Smith');
    });

    it('should throw NotFoundError for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(employeeService.getEmployeeById(fakeId)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for invalid id format', async () => {
      await expect(employeeService.getEmployeeById('bad-id')).rejects.toThrow(NotFoundError);
    });
  });

  // ─── GET ALL ──────────────────────────────────────────────
  describe('getAllEmployees', () => {
    const seedMultiple = async () => {
      const employees = [
        validInput({ fullName: 'Alice A', email: 'alice@company.com', salary: 90000 }),
        validInput({ fullName: 'Bob B', email: 'bob@company.com', salary: 80000, country: 'India' }),
        validInput({ fullName: 'Carol C', email: 'carol@company.com', salary: 70000 }),
      ];
      for (const emp of employees) {
        await employeeService.createEmployee(emp);
      }
    };

    it('should return paginated results', async () => {
      await seedMultiple();

      const result = await employeeService.getAllEmployees({});

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
    });

    it('should enforce default pagination (page=1, limit=20)', async () => {
      await seedMultiple();

      const result = await employeeService.getAllEmployees({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should cap limit to 100', async () => {
      await seedMultiple();

      const result = await employeeService.getAllEmployees({ limit: 500 });

      expect(result.limit).toBeLessThanOrEqual(100);
    });

    it('should default page to 1 if invalid', async () => {
      await seedMultiple();

      const result = await employeeService.getAllEmployees({ page: -1 });

      expect(result.page).toBe(1);
    });

    it('should pass filters to repository', async () => {
      await seedMultiple();

      const result = await employeeService.getAllEmployees({ country: 'India' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].country).toBe('India');
    });
  });

  // ─── UPDATE ───────────────────────────────────────────────
  describe('updateEmployee', () => {
    it('should update and return the employee', async () => {
      const created = await employeeService.createEmployee(validInput());

      const result = await employeeService.updateEmployee(created._id, {
        salary: 120000,
        jobTitle: 'Senior Software Engineer',
      });

      expect(result.salary).toBe(120000);
      expect(result.jobTitle).toBe('Senior Software Engineer');
      expect(result.fullName).toBe('John Smith'); // unchanged
    });

    it('should throw NotFoundError for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        employeeService.updateEmployee(fakeId, { salary: 100000 })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid update data', async () => {
      const created = await employeeService.createEmployee(validInput());

      await expect(
        employeeService.updateEmployee(created._id, { salary: -100 })
      ).rejects.toThrow(ValidationError);
    });

    it('should allow partial updates (only salary)', async () => {
      const created = await employeeService.createEmployee(validInput());

      const result = await employeeService.updateEmployee(created._id, { salary: 105000 });

      expect(result.salary).toBe(105000);
      expect(result.fullName).toBe('John Smith');
      expect(result.department).toBe('Engineering');
    });
  });

  // ─── DELETE ───────────────────────────────────────────────
  describe('deleteEmployee', () => {
    it('should delete the employee successfully', async () => {
      const created = await employeeService.createEmployee(validInput());

      await expect(employeeService.deleteEmployee(created._id)).resolves.not.toThrow();
    });

    it('should throw NotFoundError for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(employeeService.deleteEmployee(fakeId)).rejects.toThrow(NotFoundError);
    });
  });
});
