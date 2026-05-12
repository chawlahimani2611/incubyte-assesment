const express = require('express');
const { z } = require('zod');
const insightsService = require('../services/insightsService');
const validate = require('../middleware/validate');

const router = express.Router();

// Optional Zod schema for validating the country query parameter
const jobTitleQuerySchema = z.object({
  country: z.string().trim().optional(),
});

/**
 * @route   GET /api/insights/salary-by-country
 * @desc    Get aggregated salary metrics grouped by country
 * @access  Public
 */
router.get('/salary-by-country', async (req, res, next) => {
  try {
    const data = await insightsService.getSalarySummaryByCountry();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/insights/salary-by-job-title
 * @desc    Get aggregated salary metrics grouped by job title, optionally filtered by country
 * @access  Public
 */
router.get(
  '/salary-by-job-title',
  validate({ query: jobTitleQuerySchema }),
  async (req, res, next) => {
    try {
      const data = await insightsService.getSalarySummaryByJobTitle(req.query.country);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/insights/departments
 * @desc    Get aggregated summary metrics grouped by department
 * @access  Public
 */
router.get('/departments', async (req, res, next) => {
  try {
    const data = await insightsService.getDepartmentSummary();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/insights/salary-distribution
 * @desc    Get salary distribution histogram buckets
 * @access  Public
 */
router.get('/salary-distribution', async (req, res, next) => {
  try {
    const data = await insightsService.getSalaryDistribution();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/insights/headcount-by-country
 * @desc    Get headcount breakdown grouped by country
 * @access  Public
 */
router.get('/headcount-by-country', async (req, res, next) => {
  try {
    const data = await insightsService.getHeadcountByCountry();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
