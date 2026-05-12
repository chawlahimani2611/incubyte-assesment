import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeleteConfirmation from './DeleteConfirmation';

describe('DeleteConfirmation Component Unit Tests', () => {
  it('should display the employee name and confirmation message cleanly', () => {
    const employee = { fullName: 'George Washington', email: 'george@company.com' };
    render(
      <DeleteConfirmation
        open={true}
        employee={employee}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText(/Remove Employee Record/i)).toBeInTheDocument();
    expect(screen.getByText(/George Washington/i)).toBeInTheDocument();
  });

  it('should trigger onConfirm callback when clicking the confirm danger button', () => {
    const handleConfirm = vi.fn();
    const employee = { fullName: 'George Washington' };

    render(
      <DeleteConfirmation
        open={true}
        employee={employee}
        onConfirm={handleConfirm}
        onCancel={() => {}}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /Yes, Delete/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalled();
  });
});
