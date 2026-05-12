const Employee = require('../models/Employee');

/**
 * Insights Repository
 *
 * Executes optimized MongoDB Aggregation Pipelines to derive salary analytics,
 * headcount summaries, and distribution histograms.
 */

/**
 * Get salary metrics (min, max, avg, headcount) grouped by country.
 * Uses the index on { country: 1 }.
 *
 * @returns {Promise<Array>} Array of country salary metrics
 */
const getSalaryByCountry = async () => {
  return Employee.aggregate([
    {
      $group: {
        _id: '$country',
        minSalary: { $min: '$salary' },
        maxSalary: { $max: '$salary' },
        avgSalary: { $avg: '$salary' },
        headcount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        country: '$_id',
        minSalary: 1,
        maxSalary: 1,
        avgSalary: 1,
        headcount: 1,
      },
    },
    {
      $sort: { country: 1 },
    },
  ]);
};

/**
 * Get average salary and headcount grouped by job title.
 * Optionally filters by country. Uses indexes on country and jobTitle.
 *
 * @param {string} [country] - Optional country filter
 * @returns {Promise<Array>} Array of job title metrics sorted by avgSalary desc
 */
const getSalaryByJobTitle = async (country) => {
  const pipeline = [];

  if (country) {
    pipeline.push({ $match: { country } });
  }

  pipeline.push(
    {
      $group: {
        _id: '$jobTitle',
        avgSalary: { $avg: '$salary' },
        headcount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        jobTitle: '$_id',
        avgSalary: 1,
        headcount: 1,
      },
    },
    {
      $sort: { avgSalary: -1 },
    }
  );

  return Employee.aggregate(pipeline);
};

/**
 * Get summary metrics grouped by department.
 * Uses the index on { department: 1 }.
 *
 * @returns {Promise<Array>} Array of department summaries
 */
const getDepartmentSummary = async () => {
  return Employee.aggregate([
    {
      $group: {
        _id: '$department',
        avgSalary: { $avg: '$salary' },
        headcount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        department: '$_id',
        avgSalary: 1,
        headcount: 1,
      },
    },
    {
      $sort: { department: 1 },
    },
  ]);
};

/**
 * Get salary distribution histogram using automatic bucket generation.
 * Guarded against empty collections to prevent driver errors.
 *
 * @returns {Promise<Array>} Histogram buckets with min, max, and count
 */
const getSalaryDistribution = async () => {
  // Prevent $bucketAuto crash if collection is empty
  const totalDocs = await Employee.countDocuments();
  if (totalDocs === 0) {
    return [];
  }

  return Employee.aggregate([
    {
      $bucketAuto: {
        groupBy: '$salary',
        buckets: 8,
        output: {
          count: { $sum: 1 },
        },
      },
    },
    {
      $project: {
        _id: 0,
        min: '$_id.min',
        max: '$_id.max',
        count: 1,
      },
    },
    {
      $sort: { min: 1 },
    },
  ]);
};

/**
 * Get simple headcount grouped by country, sorted descending.
 * Optimized query projecting minimal attributes.
 *
 * @returns {Promise<Array>} Array of country headcounts
 */
const getHeadcountByCountry = async () => {
  return Employee.aggregate([
    {
      $group: {
        _id: '$country',
        headcount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        country: '$_id',
        headcount: 1,
      },
    },
    {
      $sort: { headcount: -1 },
    },
  ]);
};

module.exports = {
  getSalaryByCountry,
  getSalaryByJobTitle,
  getDepartmentSummary,
  getSalaryDistribution,
  getHeadcountByCountry,
};
