import React from 'react';
import { Typography } from 'antd';
import EmployeeTable from '../components/employees/EmployeeTable';

const { Title, Paragraph } = Typography;

/**
 * Enterprise Employees Roster Page
 *
 * Renders the primary search-and-filter data matrix view for browsing staff compensation.
 */
const Employees = () => {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
          Employee Roster & Management
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 4, fontSize: 15 }}>
          Search, view, and query organization compensation portfolios instantly. Use dropdown controls to segment regional arrays.
        </Paragraph>
      </div>

      <EmployeeTable />
    </div>
  );
};

export default Employees;
