const request = require('supertest');
const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../setup');

// Require app after connection/setup if needed, or directly
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

const validEmployeePayload = {
  fullName: 'Alice Smith',
  email: 'alice.smith@company.com',
  jobTitle: 'Backend Engineer',
  department: 'Engineering',
  country: 'Canada',
  salary: 105000,
  currency: 'CAD',
  hireDate: '2023-03-01',
};

describe('Employee API Routes Integration Tests', () => {
  // ─── POST /api/employees ──────────────────────────────────
  describe('POST /api/employees', () => {
    it('should create a new employee and return 201 status', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send(validEmployeePayload)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.fullName).toBe('Alice Smith');
      expect(response.body.data.email).toBe('alice.smith@company.com');
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidPayload = { ...validEmployeePayload };
      delete invalidPayload.fullName;

      const response = await request(app)
        .post('/api/employees')
        .send(invalidPayload)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should return 409 when email already exists', async () => {
      // First creation
      await request(app).post('/api/employees').send(validEmployeePayload).expect(201);

      // Duplicate creation
      const duplicatePayload = { ...validEmployeePayload, fullName: 'Alice Duplicate' };
      const response = await request(app)
        .post('/api/employees')
        .send(duplicatePayload)
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('CONFLICT');
    });
  });

  // ─── GET /api/employees ───────────────────────────────────
  describe('GET /api/employees', () => {
    beforeEach(async () => {
      // Seed two employees
      await request(app).post('/api/employees').send(validEmployeePayload);
      await request(app).post('/api/employees').send({
        ...validEmployeePayload,
        fullName: 'Bob Jones',
        email: 'bob.jones@company.com',
        country: 'United States',
      });
    });

    it('should return a list of employees with pagination metadata (200)', async () => {
      const response = await request(app)
        .get('/api/employees')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(20);
      expect(response.body.meta.totalPages).toBe(1);
    });

    it('should filter employees by country parameter', async () => {
      const response = await request(app)
        .get('/api/employees?country=Canada')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].country).toBe('Canada');
    });

    it('should respect pagination parameters (page and limit)', async () => {
      const response = await request(app)
        .get('/api/employees?page=1&limit=1')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.meta.limit).toBe(1);
      expect(response.body.meta.totalPages).toBe(2);
    });
  });

  // ─── GET /api/employees/:id ───────────────────────────────
  describe('GET /api/employees/:id', () => {
    it('should return 200 and the employee if found', async () => {
      // Create employee
      const createRes = await request(app).post('/api/employees').send(validEmployeePayload);
      const employeeId = createRes.body.data._id;

      const response = await request(app)
        .get(`/api/employees/${employeeId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(employeeId);
      expect(response.body.data.fullName).toBe('Alice Smith');
    });

    it('should return 404 if employee is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/employees/${fakeId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('NOT_FOUND');
    });

    it('should return 404/400 for invalid ObjectId format', async () => {
      await request(app)
        .get('/api/employees/invalid-id-format')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  // ─── PUT /api/employees/:id ───────────────────────────────
  describe('PUT /api/employees/:id', () => {
    it('should update the employee and return 200 status', async () => {
      const createRes = await request(app).post('/api/employees').send(validEmployeePayload);
      const employeeId = createRes.body.data._id;

      const response = await request(app)
        .put(`/api/employees/${employeeId}`)
        .send({ salary: 115000, jobTitle: 'Lead Backend Engineer' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.salary).toBe(115000);
      expect(response.body.data.jobTitle).toBe('Lead Backend Engineer');
      expect(response.body.data.fullName).toBe('Alice Smith'); // unchanged field
    });

    it('should return 404 when updating non-existent employee', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/employees/${fakeId}`)
        .send({ salary: 100000 })
        .expect(404);
    });

    it('should return 400 when update payload fails validation', async () => {
      const createRes = await request(app).post('/api/employees').send(validEmployeePayload);
      const employeeId = createRes.body.data._id;

      await request(app)
        .put(`/api/employees/${employeeId}`)
        .send({ salary: -500 }) // invalid salary
        .expect(400);
    });
  });

  // ─── DELETE /api/employees/:id ────────────────────────────
  describe('DELETE /api/employees/:id', () => {
    it('should delete the employee and return 204 status', async () => {
      const createRes = await request(app).post('/api/employees').send(validEmployeePayload);
      const employeeId = createRes.body.data._id;

      await request(app)
        .delete(`/api/employees/${employeeId}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/employees/${employeeId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent employee', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/employees/${fakeId}`)
        .expect(404);
    });
  });
});
