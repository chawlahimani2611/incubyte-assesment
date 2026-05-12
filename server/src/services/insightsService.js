const insightsRepository = require('../repositories/insightsRepository');

/**
 * Insights Service
 *
 * Orchestrates business logic and optional caching/formatting layers
 * over raw aggregation metrics returned by the repository.
 */

/**
 * Get salary metrics grouped by country.
 *
 * @returns {Promise<Array>}
 */
const getSalarySummaryByCountry = async () => {
  return insightsRepository.getSalaryByCountry();
};

/**
 * Get salary metrics grouped by job title, optionally filtered by country.
 *
 * @param {string} [country]
 * @returns {Promise<Array>}
 */
const getSalarySummaryByJobTitle = async (country) => {
  // Sanitize parameter if needed
  const sanitizedCountry = country && typeof country === 'string' ? country.trim() : undefined;
  return insightsRepository.getSalaryByJobTitle(sanitizedCountry);
};

/**
 * Get metrics grouped by department.
 *
 * @returns {Promise<Array>}
 */
const getDepartmentSummary = async () => {
  return insightsRepository.getDepartmentSummary();
};

/**
 * Get salary distribution histogram buckets.
 *
 * @returns {Promise<Array>}
 */
const getSalaryDistribution = async () => {
  return insightsRepository.getSalaryDistribution();
};

/**
 * Get headcount breakdown by country.
 *
 * @returns {Promise<Array>}
 */
const getHeadcountByCountry = async () => {
  return insightsRepository.getHeadcountByCountry();
};

module.exports = {
  getSalarySummaryByCountry,
  getSalarySummaryByJobTitle,
  getDepartmentSummary,
  getSalaryDistribution,
  getHeadcountByCountry,
};
