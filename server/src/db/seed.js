const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { connectToDatabase } = require('../config/database');

const DEFAULT_FIRST_NAMES_PATH = path.join(__dirname, '../../data/first_names.txt');
const DEFAULT_LAST_NAMES_PATH = path.join(__dirname, '../../data/last_names.txt');

const jobTitles = [
  'Software Engineer',
  'Senior Backend Engineer',
  'Lead Developer',
  'Engineering Manager',
  'QA Engineer',
  'DevOps Specialist',
  'Product Manager',
  'HR Specialist',
  'Sales Representative',
  'Marketing Director',
];

const departments = [
  'Engineering',
  'Product',
  'Human Resources',
  'Sales',
  'Marketing',
  'Operations',
];

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'India',
  'Australia',
  'Singapore',
];

/**
 * Performant Database Seeding Script
 *
 * Generates and inserts `targetCount` records with high-throughput batching,
 * progress tracking, and idempotent collection cleanup.
 *
 * @param {Object} options
 * @param {string} [options.firstNamesPath] - Path to first names file
 * @param {string} [options.lastNamesPath]  - Path to last names file
 * @param {number} [options.targetCount=10000] - Total employees to seed
 * @param {number} [options.batchSize=5000]    - Number of documents per insert batch
 * @param {boolean} [options.silent=false]     - Suppress console output
 * @returns {Promise<{success: boolean, insertedCount: number, durationMs: number}>}
 */
const seedDatabase = async (options = {}) => {
  const {
    firstNamesPath = DEFAULT_FIRST_NAMES_PATH,
    lastNamesPath = DEFAULT_LAST_NAMES_PATH,
    targetCount = 10000,
    batchSize = 5000,
    silent = false,
  } = options;

  const log = (msg) => {
    if (!silent) console.log(msg);
  };

  const startTime = Date.now();

  try {
    log('🌱 Starting performant database seeding process...');

    // 1. Read and parse name files
    const [firstNamesRaw, lastNamesRaw] = await Promise.all([
      fs.readFile(firstNamesPath, 'utf8'),
      fs.readFile(lastNamesPath, 'utf8'),
    ]);

    const firstNames = firstNamesRaw
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);
    const lastNames = lastNamesRaw
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    if (!firstNames.length || !lastNames.length) {
      throw new Error('Name files must contain at least one valid entry.');
    }

    log(`📁 Loaded ${firstNames.length} first names and ${lastNames.length} last names.`);

    // 2. Idempotency: Clear existing collection data
    log('🧹 Clearing existing employee collection records...');
    await Employee.deleteMany({});
    log('✅ Existing collection successfully cleared.');

    // 3. Generate documents in-memory using highly optimized combinatorial mappings
    log(`⚙️ Generating exactly ${targetCount} unique employee records in memory...`);
    const employees = [];

    const numFirsts = firstNames.length;
    const numLasts = lastNames.length;

    for (let i = 0; i < targetCount; i++) {
      const fIdx = i % numFirsts;
      const lIdx = Math.floor(i / numFirsts) % numLasts;

      const firstName = firstNames[fIdx];
      const lastName = lastNames[lIdx];
      const fullName = `${firstName} ${lastName}`;

      // Guarantee absolute uniqueness for unique index requirement
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@company.com`;

      const jobTitle = jobTitles[i % jobTitles.length];
      const department = departments[i % departments.length];
      const country = countries[i % countries.length];

      // Deterministic salary distribution between 50k and 150k
      const salary = 50000 + (i % 11) * 10000;

      // Deterministic hire dates spread across the last ~3 years
      const hireDate = new Date(Date.now() - (i % 1000) * 86400000);

      employees.push({
        fullName,
        email,
        jobTitle,
        department,
        country,
        salary,
        currency: 'USD',
        hireDate,
      });
    }

    // 4. Batch Insertion for peak execution throughput
    log(`🚀 Seeding documents in batches of ${batchSize}...`);
    let insertedCount = 0;

    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize);
      await Employee.insertMany(batch, { ordered: false, lean: true });
      insertedCount += batch.length;
      log(`⏳ Progress: ${insertedCount} / ${targetCount} inserted...`);
    }

    const durationMs = Date.now() - startTime;
    log(`🎉 Seeding completed successfully! Inserted ${insertedCount} records in ${durationMs}ms.`);

    return {
      success: true,
      insertedCount,
      durationMs,
    };
  } catch (error) {
    if (!silent) console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// If executed directly from CLI (e.g. node src/db/seed.js)
if (require.main === module) {
  require('dotenv').config();
  (async () => {
    try {
      await connectToDatabase();
      await seedDatabase();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  })();
}

module.exports = seedDatabase;
