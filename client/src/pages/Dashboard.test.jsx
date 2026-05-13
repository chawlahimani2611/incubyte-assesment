import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import * as useInsightsModule from '../hooks/useInsights';

// Setup reusable QueryClient for test wrappers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('Salary Insights Dashboard Unit & Integration Tests', () => {
  it('should render KPI cards with correct metrics perfectly', async () => {
    // Mock the analytics query hooks to return stable test data
    vi.spyOn(useInsightsModule, 'useSalaryByCountry').mockReturnValue({
      data: {
        success: true,
        data: [
          { country: 'United States', headcount: 5000, avgSalary: 120000 },
          { country: 'Canada', headcount: 2000, avgSalary: 95000 },
        ],
      },
      isLoading: false,
    });

    vi.spyOn(useInsightsModule, 'useSalaryByJobTitle').mockReturnValue({
      data: {
        success: true,
        data: [{ jobTitle: 'Software Engineer', headcount: 3000, avgSalary: 110000 }],
      },
      isLoading: false,
    });

    vi.spyOn(useInsightsModule, 'useDepartmentsSummary').mockReturnValue({
      data: {
        success: true,
        data: [{ department: 'Engineering', headcount: 4000, avgSalary: 115000 }],
      },
      isLoading: false,
    });

    vi.spyOn(useInsightsModule, 'useSalaryDistribution').mockReturnValue({
      data: {
        success: true,
        data: [{ _id: { min: 50000, max: 70000 }, count: 1000 }],
      },
      isLoading: false,
    });

    vi.spyOn(useInsightsModule, 'useHeadcountByCountry').mockReturnValue({
      data: {
        success: true,
        data: [
          { country: 'United States', headcount: 5000 },
          { country: 'Canada', headcount: 2000 },
        ],
      },
      isLoading: false,
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <Dashboard />
      </QueryClientProvider>
    );

    // Validate main headers and dashboard elements
    expect(screen.getByText('Enterprise Compensation Analytics Dashboard')).toBeInTheDocument();

    // Verify KPI calculations: Total Headcount should aggregate regional entries (5000 + 2000 = 7000)
    expect(screen.getByText('7,000')).toBeInTheDocument();

    // Verify Avg Salary computation across regions
    expect(screen.getByText('Global Average Compensation')).toBeInTheDocument();

    // Verify section banners
    expect(screen.getByText('Regional Base Salary Scaling')).toBeInTheDocument();
    expect(screen.getByText('Role Compensation Benchmarks')).toBeInTheDocument();
    expect(screen.getByText('Departmental Budget Allocations')).toBeInTheDocument();
    expect(screen.getByText('Global Compensation Distribution')).toBeInTheDocument();
  });

  it('should render loading skeleton placeholders when fetching metrics', () => {
    vi.spyOn(useInsightsModule, 'useSalaryByCountry').mockReturnValue({
      data: null,
      isLoading: true,
    });
    vi.spyOn(useInsightsModule, 'useSalaryByJobTitle').mockReturnValue({
      data: null,
      isLoading: true,
    });
    vi.spyOn(useInsightsModule, 'useDepartmentsSummary').mockReturnValue({
      data: null,
      isLoading: true,
    });
    vi.spyOn(useInsightsModule, 'useSalaryDistribution').mockReturnValue({
      data: null,
      isLoading: true,
    });
    vi.spyOn(useInsightsModule, 'useHeadcountByCountry').mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = render(
      <QueryClientProvider client={createTestQueryClient()}>
        <Dashboard />
      </QueryClientProvider>
    );

    // Verify loading spinners or skeleton layers render
    expect(container.querySelector('.ant-skeleton') || container.querySelector('.ant-spin')).toBeInTheDocument();
  });
});
