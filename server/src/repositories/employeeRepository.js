const mongoose = require('mongoose');
const Employee = require('../models/Employee');

/**
 * Employee Repository
 *
 * Data access layer providing CRUD operations and query building
 * for the Employee model. Abstracts Mongoose details from the service layer.
 */

/**
 * Check if a given string is a valid MongoDB ObjectId.
 *
 * @param {string} id - The ID to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Create a new employee document.
 *
 * @param {Object} employeeData - The employee fields
 * @returns {Promise<Object>} The created employee document
 * @throws {Error} On validation failure or duplicate email
 */
const create = async (employeeData) => {
  const employee = new Employee(employeeData);
  return employee.save();
};

/**
 * Find an employee by their MongoDB ObjectId.
 *
 * @param {string|ObjectId} id - The employee's _id
 * @returns {Promise<Object|null>} The employee or null if not found / invalid id
 */
const findById = async (id) => {
  if (!isValidObjectId(id)) {
    return null;
  }
  return Employee.findById(id);
};

/**
 * Find employees with pagination, filtering, search, and sorting.
 *
 * @param {Object} options - Query options
 * @param {number}  [options.page=1]           - Page number (1-indexed)
 * @param {number}  [options.limit=20]         - Results per page (max 100)
 * @param {string}  [options.search]           - Search term for fullName / email
 * @param {string}  [options.country]          - Filter by country
 * @param {string}  [options.jobTitle]         - Filter by job title
 * @param {string}  [options.department]       - Filter by department
 * @param {string}  [options.sortBy='createdAt']  - Field to sort by
 * @param {string}  [options.sortOrder='desc']    - Sort direction ('asc' or 'desc')
 * @returns {Promise<{data: Object[], total: number, page: number, limit: number, totalPages: number}>}
 */
const findAll = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    search,
    country,
    jobTitle,
    department,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  // Build the filter query
  const query = buildFilterQuery({ search, country, jobTitle, department });

  // Build sort object
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Execute query and count in parallel for performance
  const [data, total] = await Promise.all([
    Employee.find(query).sort(sort).skip(skip).limit(limit),
    Employee.countDocuments(query),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Update an employee by ID with partial data.
 *
 * @param {string|ObjectId} id   - The employee's _id
 * @param {Object}          data - Fields to update
 * @returns {Promise<Object|null>} The updated employee or null if not found
 */
const update = async (id, data) => {
  if (!isValidObjectId(id)) {
    return null;
  }
  return Employee.findByIdAndUpdate(id, data, {
    new: true,           // Return the updated document
    runValidators: true, // Run schema validators on update
  });
};

/**
 * Delete an employee by ID.
 *
 * @param {string|ObjectId} id - The employee's _id
 * @returns {Promise<boolean>} true if deleted, false if not found
 */
const deleteById = async (id) => {
  if (!isValidObjectId(id)) {
    return false;
  }
  const result = await Employee.findByIdAndDelete(id);
  return result !== null;
};

// ─── Private Helpers ────────────────────────────────────────

/**
 * Build a MongoDB filter query from the provided filter parameters.
 *
 * @param {Object} filters
 * @param {string} [filters.search]     - Case-insensitive regex on fullName/email
 * @param {string} [filters.country]    - Exact match on country
 * @param {string} [filters.jobTitle]   - Exact match on jobTitle
 * @param {string} [filters.department] - Exact match on department
 * @returns {Object} MongoDB query object
 */
const buildFilterQuery = ({ search, country, jobTitle, department }) => {
  const query = {};

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (country) {
    query.country = country;
  }

  if (jobTitle) {
    query.jobTitle = jobTitle;
  }

  if (department) {
    query.department = department;
  }

  return query;
};

module.exports = {
  create,
  findById,
  findAll,
  update,
  delete: deleteById,
};
