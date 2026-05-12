const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../../setup');

// We'll import the Employee model once it exists
// This test file is written BEFORE the implementation (TDD Red phase)
let Employee;

beforeAll(async () => {
  await connect();
  // Import after connection is established
  Employee = require('../../../src/models/Employee');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Employee Model', () => {
  const validEmployeeData = {
    fullName: 'John Smith',
    email: 'john.smith@company.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    country: 'United States',
    salary: 95000,
    currency: 'USD',
    hireDate: new Date('2023-01-15'),
  };

  describe('Schema Validation', () => {
    it('should create an employee with all valid fields', async () => {
      const employee = new Employee(validEmployeeData);
      const saved = await employee.save();

      expect(saved._id).toBeDefined();
      expect(saved.fullName).toBe('John Smith');
      expect(saved.email).toBe('john.smith@company.com');
      expect(saved.jobTitle).toBe('Software Engineer');
      expect(saved.department).toBe('Engineering');
      expect(saved.country).toBe('United States');
      expect(saved.salary).toBe(95000);
      expect(saved.currency).toBe('USD');
      expect(saved.hireDate).toEqual(new Date('2023-01-15'));
      expect(saved.createdAt).toBeDefined();
      expect(saved.updatedAt).toBeDefined();
    });

    it('should default currency to USD when not provided', async () => {
      const data = { ...validEmployeeData };
      delete data.currency;
      const employee = new Employee(data);
      const saved = await employee.save();

      expect(saved.currency).toBe('USD');
    });

    it('should trim whitespace from fullName', async () => {
      const employee = new Employee({
        ...validEmployeeData,
        fullName: '  John Smith  ',
      });
      const saved = await employee.save();

      expect(saved.fullName).toBe('John Smith');
    });

    it('should lowercase the email', async () => {
      const employee = new Employee({
        ...validEmployeeData,
        email: 'JOHN.SMITH@COMPANY.COM',
      });
      const saved = await employee.save();

      expect(saved.email).toBe('john.smith@company.com');
    });

    it('should auto-generate timestamps (createdAt, updatedAt)', async () => {
      const employee = new Employee(validEmployeeData);
      const saved = await employee.save();

      expect(saved.createdAt).toBeInstanceOf(Date);
      expect(saved.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Required Field Validation', () => {
    it('should fail without fullName', async () => {
      const data = { ...validEmployeeData };
      delete data.fullName;
      const employee = new Employee(data);

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail without email', async () => {
      const data = { ...validEmployeeData };
      delete data.email;
      const employee = new Employee(data);

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail without jobTitle', async () => {
      const data = { ...validEmployeeData };
      delete data.jobTitle;
      const employee = new Employee(data);

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail without department', async () => {
      const data = { ...validEmployeeData };
      delete data.department;
      const employee = new Employee(data);

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail without country', async () => {
      const data = { ...validEmployeeData };
      delete data.country;
      const employee = new Employee(data);

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail without salary', async () => {
      const data = { ...validEmployeeData };
      delete data.salary;
      const employee = new Employee(data);

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail without hireDate', async () => {
      const data = { ...validEmployeeData };
      delete data.hireDate;
      const employee = new Employee(data);

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe('Value Validation', () => {
    it('should fail with negative salary', async () => {
      const employee = new Employee({
        ...validEmployeeData,
        salary: -1000,
      });

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail with zero salary', async () => {
      const employee = new Employee({
        ...validEmployeeData,
        salary: 0,
      });

      await expect(employee.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should accept a valid positive salary', async () => {
      const employee = new Employee({
        ...validEmployeeData,
        salary: 50000,
      });
      const saved = await employee.save();

      expect(saved.salary).toBe(50000);
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique email', async () => {
      const employee1 = new Employee(validEmployeeData);
      await employee1.save();

      const employee2 = new Employee({
        ...validEmployeeData,
        fullName: 'Jane Smith',
      });

      await expect(employee2.save()).rejects.toThrow();
    });
  });

  describe('Indexes', () => {
    beforeAll(async () => {
      // Ensure indexes are built in the in-memory database
      await Employee.syncIndexes();
    });

    it('should have an index on country', async () => {
      const indexes = await Employee.collection.indexes();
      const hasIndex = indexes.some((idx) => idx.key && idx.key.country === 1);

      expect(hasIndex).toBe(true);
    });

    it('should have an index on jobTitle', async () => {
      const indexes = await Employee.collection.indexes();
      const hasIndex = indexes.some((idx) => idx.key && idx.key.jobTitle === 1);

      expect(hasIndex).toBe(true);
    });

    it('should have an index on department', async () => {
      const indexes = await Employee.collection.indexes();
      const hasIndex = indexes.some((idx) => idx.key && idx.key.department === 1);

      expect(hasIndex).toBe(true);
    });

    it('should have a compound index on country + jobTitle', async () => {
      const indexes = await Employee.collection.indexes();
      const hasCompound = indexes.some(
        (idx) => idx.key && idx.key.country === 1 && idx.key.jobTitle === 1
      );

      expect(hasCompound).toBe(true);
    });

    it('should have a unique index on email', async () => {
      const indexes = await Employee.collection.indexes();
      const emailIndex = indexes.find(
        (idx) => idx.key && idx.key.email === 1 && idx.unique === true
      );

      expect(emailIndex).toBeDefined();
    });
  });
});
