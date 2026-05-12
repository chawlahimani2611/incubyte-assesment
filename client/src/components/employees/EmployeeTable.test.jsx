import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmployeeTable from './EmployeeTable';
import * as useEmployeesModule from '../../hooks/useEmployees';

// Setup reusable QueryClient for test wrappers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('EmployeeTable Integration & Unit Tests', () => {
  it('should render employee data correctly inside the table view', async () => {
    // Mock the custom hook to return stable test data
    vi.spyOn(useEmployeesModule, 'default').mockReturnValue({
      data: {
        success: true,
        data: [
          {
            _id: 'emp-1',
            fullName: 'Sarah Jenkins',
            email: 'sarah.j@company.com',
            jobTitle: 'Senior Backend Engineer',
            department: 'Engineering',
            country: 'United States',
            salary: 140000,
            currency: 'USD',
          },
          {
            _id: 'emp-2',
            fullName: 'David Miller',
            email: 'david.m@company.com',
            jobTitle: 'Product Manager',
            department: 'Product',
            country: 'Canada',
            salary: 110000,
            currency: 'USD',
          },
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <EmployeeTable />
      </QueryClientProvider>
    );

    // Validate table content renders perfectly
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('sarah.j@company.com')).toBeInTheDocument();
    expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();

    expect(screen.getByText('David Miller')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
  });

  it('should trigger search filter changes when typing into the search input', async () => {
    const mockHook = vi.spyOn(useEmployeesModule, 'default').mockReturnValue({
      data: {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      },
      isLoading: false,
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <EmployeeTable />
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search by name or email/i);
    fireEvent.change(searchInput, { target: { value: 'Sarah' } });

    await waitFor(() => {
      expect(searchInput.value).toBe('Sarah');
    });
  });

  it('should render loading placeholders when fetching data', () => {
    vi.spyOn(useEmployeesModule, 'default').mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = render(
      <QueryClientProvider client={createTestQueryClient()}>
        <EmployeeTable />
      </QueryClientProvider>
    );

    // Ant Design Table loading state adds ant-table-wrapper or ant-spin indicators
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });
});
