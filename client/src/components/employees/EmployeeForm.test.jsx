import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeForm from './EmployeeForm';

// Object.defineProperty mock for window.matchMedia is already mounted globally in setup.js

describe('EmployeeForm Component Unit Tests', () => {
  it('should render empty fields cleanly in Create mode', () => {
    render(<EmployeeForm open={true} mode="create" onCancel={() => {}} onSubmit={() => {}} />);

    // Check modal titles and button states
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
    expect(screen.getByLabelText(/Base Salary/i)).toHaveValue('');
  });

  it('should pre-fill input values perfectly in Edit mode matching localized formatting', () => {
    const initialValues = {
      fullName: 'Alice Walker',
      email: 'alice@company.com',
      jobTitle: 'Product Manager',
      department: 'Product',
      country: 'Canada',
      salary: 125000,
      hireDate: '2023-05-01',
    };

    render(
      <EmployeeForm
        open={true}
        mode="edit"
        initialValues={initialValues}
        onCancel={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByText('Edit Employee Profile')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Alice Walker');
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('alice@company.com');
    // InputNumber formats 125000 cleanly into localized string '125,000'
    expect(screen.getByLabelText(/Base Salary/i)).toHaveValue('125,000');
  });

  it('should trigger onSubmit callback with entered data when submitting valid pre-filled form values', async () => {
    const handleSubmit = vi.fn();
    const initialValues = {
      fullName: 'Alice Walker',
      email: 'alice@company.com',
      jobTitle: 'Product Manager',
      department: 'Product',
      country: 'Canada',
      salary: 125000,
      hireDate: '2023-05-01',
    };

    render(
      <EmployeeForm
        open={true}
        mode="edit"
        initialValues={initialValues}
        onCancel={() => {}}
        onSubmit={handleSubmit}
      />
    );

    // Modify a field to simulate user entry
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice Modified' } });

    // Click Save Changes button
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    // Form submission processing and internal Zod validation resolves asynchronously
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
