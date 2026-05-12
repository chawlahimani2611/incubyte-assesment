const mongoose = require('mongoose');

/**
 * Employee Schema
 *
 * Represents an employee in the organization with their personal details,
 * job information, and salary data.
 *
 * Indexes:
 * - country: for country-based salary aggregation queries
 * - jobTitle: for job title lookups and filtering
 * - department: for department-based filtering
 * - { country, jobTitle }: compound index for salary-by-job-title-in-country queries
 * - email: unique index (enforced by schema)
 */
const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [1, 'Salary must be greater than 0'],
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      trim: true,
    },
    hireDate: {
      type: Date,
      required: [true, 'Hire date is required'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ----- Indexes for query performance -----

// Single field indexes for filtering and aggregation
employeeSchema.index({ country: 1 });
employeeSchema.index({ jobTitle: 1 });
employeeSchema.index({ department: 1 });

// Compound index for salary analytics: "average salary per job title in a country"
employeeSchema.index({ country: 1, jobTitle: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
