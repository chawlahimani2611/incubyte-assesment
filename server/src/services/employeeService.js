const { z } = require('zod');
const employeeRepository = require('../repositories/employeeRepository');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

// ─── Zod Validation Schemas ─────────────────────────────────

/**
 * Schema for creating a new employee.
 * All fields required except email (auto-generated) and currency (defaults to USD).
 */
const createEmployeeSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(1, 'Full name is required'),
  email: z.string().email('Invalid email format').optional(),
  jobTitle: z
    .string({ required_error: 'Job title is required' })
    .trim()
    .min(1, 'Job title is required'),
  department: z
    .string({ required_error: 'Department is required' })
    .trim()
    .min(1, 'Department is required'),
  country: z
    .string({ required_error: 'Country is required' })
    .trim()
    .min(1, 'Country is required'),
  salary: z
    .number({ required_error: 'Salary is required', invalid_type_error: 'Salary must be a number' })
    .positive('Salary must be greater than 0'),
  currency: z.string().trim().default('USD'),
  hireDate: z.coerce.date({ required_error: 'Hire date is required' }),
});

/**
 * Schema for updating an employee. All fields optional, but validated if present.
 */
const updateEmployeeSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name cannot be empty').optional(),
  email: z.string().email('Invalid email format').optional(),
  jobTitle: z.string().trim().min(1, 'Job title cannot be empty').optional(),
  department: z.string().trim().min(1, 'Department cannot be empty').optional(),
  country: z.string().trim().min(1, 'Country cannot be empty').optional(),
  salary: z.number().positive('Salary must be greater than 0').optional(),
  currency: z.string().trim().optional(),
  hireDate: z.coerce.date().optional(),
});

// ─── Service Methods ────────────────────────────────────────

/**
 * Create a new employee with input validation and auto email generation.
 *
 * @param {Object} data - Raw employee input
 * @returns {Promise<Object>} The created employee
 * @throws {ValidationError} If input fails Zod validation
 * @throws {ConflictError} If email already exists
 */
const createEmployee = async (data) => {
  // Validate input
  const parsed = validateInput(createEmployeeSchema, data);

  // Auto-generate email if not provided
  if (!parsed.email) {
    parsed.email = generateEmail(parsed.fullName);
  }

  try {
    return await employeeRepository.create(parsed);
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      throw new ConflictError(`Employee with email '${parsed.email}' already exists`);
    }
    throw error;
  }
};

/**
 * Get a single employee by ID.
 *
 * @param {string} id - Employee ID
 * @returns {Promise<Object>} The employee
 * @throws {NotFoundError} If employee not found or ID is invalid
 */
const getEmployeeById = async (id) => {
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    throw new NotFoundError('Employee', id);
  }
  return employee;
};

/**
 * Get all employees with pagination, filtering, and sorting.
 * Enforces pagination limits (max 100 per page).
 *
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
const getAllEmployees = async (options = {}) => {
  // Enforce pagination defaults and limits
  const sanitized = {
    ...options,
    page: Math.max(1, parseInt(options.page, 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20)),
  };

  return employeeRepository.findAll(sanitized);
};

/**
 * Update an employee by ID with partial data.
 *
 * @param {string} id   - Employee ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} The updated employee
 * @throws {NotFoundError} If employee not found
 * @throws {ValidationError} If update data is invalid
 */
const updateEmployee = async (id, data) => {
  // Validate update data
  const parsed = validateInput(updateEmployeeSchema, data);

  const updated = await employeeRepository.update(id, parsed);
  if (!updated) {
    throw new NotFoundError('Employee', id);
  }
  return updated;
};

/**
 * Delete an employee by ID.
 *
 * @param {string} id - Employee ID
 * @throws {NotFoundError} If employee not found
 */
const deleteEmployee = async (id) => {
  const deleted = await employeeRepository.delete(id);
  if (!deleted) {
    throw new NotFoundError('Employee', id);
  }
};

// ─── Private Helpers ────────────────────────────────────────

/**
 * Validate input data against a Zod schema.
 * Converts Zod errors into our custom ValidationError format.
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @param {Object}      data   - The data to validate
 * @returns {Object} The parsed/validated data
 * @throws {ValidationError} If validation fails
 */
const validateInput = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fieldErrors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ValidationError('Validation failed', fieldErrors);
  }
  return result.data;
};

/**
 * Generate an email address from a full name.
 * e.g., "John Smith" → "john.smith@company.com"
 *
 * @param {string} fullName - The employee's full name
 * @returns {string} Generated email
 */
const generateEmail = (fullName) => {
  const sanitized = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove non-alpha chars
    .trim()
    .replace(/\s+/g, '.'); // Replace spaces with dots
  return `${sanitized}@company.com`;
};

module.exports = {
  createEmployee,
  getEmployeeById,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
};
