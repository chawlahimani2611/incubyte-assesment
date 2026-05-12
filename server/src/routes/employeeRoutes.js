const express = require('express');
const employeeService = require('../services/employeeService');

const router = express.Router();

/**
 * @route   POST /api/employees
 * @desc    Create a new employee
 * @access  Public
 */
router.post('/', async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/employees
 * @desc    Get all employees with pagination, filtering, and sorting
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/employees/:id
 * @desc    Get a single employee by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/employees/:id
 * @desc    Update an employee by ID
 * @access  Public
 */
router.put('/:id', async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete an employee by ID
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
