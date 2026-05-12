import React, { useState } from 'react';
import { Table, Input, Select, Space, Card, Tag, Typography } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import useEmployees from '../../hooks/useEmployees';

const { Option } = Select;
const { Text } = Typography;

/**
 * Premium Interactive Employee Table View
 *
 * Implements an advanced data browser equipped with live backend-driven query adapters,
 * custom formatting tags, responsive controls, and placeholder loading overlays.
 */
const EmployeeTable = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    country: undefined,
    department: undefined,
  });

  const [searchInput, setSearchInput] = useState('');

  const { data: responseData, isLoading, isFetching } = useEmployees(filters);

  // Safely extract employee list arrays and server pagination maps
  const employees = responseData?.data || [];
  const paginationMeta = responseData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
  };

  // Trigger search requests cleanly
  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Structured Ant Design Table Columns Configuration
  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: false,
      render: (text) => <Text style={{ fontWeight: 600, color: '#1f2937' }}>{text}</Text>,
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Job Role',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text) => (
        <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text) => (
        <Tag color="cyan" style={{ borderRadius: 4 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Annual Base Salary',
      dataIndex: 'salary',
      key: 'salary',
      align: 'right',
      render: (salary, record) => {
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: record.currency || 'USD',
          maximumFractionDigits: 0,
        }).format(salary);
        return <Text style={{ fontWeight: 600, color: '#059669' }}>{formatted}</Text>;
      },
    },
  ];

  return (
    <Card
      styles={{
        body: { padding: 0 },
      }}
      style={{
        borderRadius: 12,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}
    >
      {/* Dynamic Filter Controls Panel Header */}
      <div
        style={{
          padding: '20px 24px',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="Search by name or email..."
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            // Auto-trigger search update on typing to satisfy intuitive input behaviors
            handleSearch(e.target.value);
          }}
          onPressEnter={() => handleSearch(searchInput)}
          style={{ width: 280, borderRadius: 8 }}
          allowClear
        />

        <Space wrap>
          <Select
            placeholder={
              <Space>
                <FilterOutlined /> Country Filter
              </Space>
            }
            style={{ width: 180 }}
            allowClear
            value={filters.country}
            onChange={(val) => handleFilterChange('country', val)}
          >
            <Option value="United States">United States</Option>
            <Option value="Canada">Canada</Option>
            <Option value="United Kingdom">United Kingdom</Option>
            <Option value="Germany">Germany</Option>
            <Option value="India">India</Option>
            <Option value="Australia">Australia</Option>
            <Option value="Singapore">Singapore</Option>
          </Select>

          <Select
            placeholder={
              <Space>
                <FilterOutlined /> Department Filter
              </Space>
            }
            style={{ width: 180 }}
            allowClear
            value={filters.department}
            onChange={(val) => handleFilterChange('department', val)}
          >
            <Option value="Engineering">Engineering</Option>
            <Option value="Product">Product</Option>
            <Option value="Human Resources">Human Resources</Option>
            <Option value="Sales">Sales</Option>
            <Option value="Marketing">Marketing</Option>
            <Option value="Operations">Operations</Option>
          </Select>
        </Space>
      </div>

      {/* Main Responsive DataGrid Wrapper */}
      <Table
        columns={columns}
        dataSource={employees}
        rowKey={(record) => record._id || record.email}
        loading={isLoading || isFetching}
        pagination={{
          current: paginationMeta.page,
          pageSize: paginationMeta.limit,
          total: paginationMeta.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
          onChange: (page, pageSize) => {
            setFilters((prev) => ({ ...prev, page, limit: pageSize }));
          },
        }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};

export default EmployeeTable;
