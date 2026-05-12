import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AppLayout from './AppLayout';

describe('AppLayout Component', () => {
  it('should render the app header, sidebar branding, and inner children cleanly', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div data-testid="test-child">Inner App Content Area</div>
        </AppLayout>
      </BrowserRouter>
    );

    // Verify main header title
    expect(screen.getByText('Enterprise Compensation Management System')).toBeInTheDocument();

    // Verify child content renders
    expect(screen.getByTestId('test-child')).toBeInTheDocument();

    // Verify sidebar links are mounted
    expect(screen.getByText('Salary Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Employee Roster')).toBeInTheDocument();
  });
});
