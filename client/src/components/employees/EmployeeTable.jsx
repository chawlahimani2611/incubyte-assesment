import React, { useState } from 'react';
import {
  Table, Input, Select, Space, Card, Tag, Typography, Button, Tooltip, notification,
} from 'antd';
import {
  SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import useEmployees, {
  useCreateEmployee, useUpdateEmployee, useDeleteEmployee,
} from '../../hooks/useEmployees';
import EmployeeForm from './EmployeeForm';
import DeleteConfirmation from './DeleteConfirmation';
import EmptyState from '../common/EmptyState';
import { TableSkeleton } from '../common/Skeletons';

const { Option } = Select;
const { Text } = Typography;

/**
 * Premium Interactive Employee Table View
 *
 * Full CRUD-capable data browser with live backend query adapters,
 * inline Create / Edit / Delete actions, and paginated server-side filtering.
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

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');           // 'create' | 'edit'
  const [editingEmployee, setEditingEmployee] = useState(null); // employee record for edit

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  // Data queries & mutations
  const {
    data: responseData, isLoading, isFetching, isError, refetch,
  } = useEmployees(filters);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const employees = responseData?.data || [];
  // Server response shape: { success, data, meta: { total, page, limit, totalPages } }
  const paginationMeta = responseData?.meta || { total: 0, page: 1, limit: 10 };

  // If query returns hard failure
  if (isError) {
    return (
      <Card style={{ borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <EmptyState variant="error" onAction={refetch} />
      </Card>
    );
  }

  // If loading initially without any cached records
  if (isLoading && employees.length === 0) {
    return <TableSkeleton rows={8} />;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = (value) => setFilters((p) => ({ ...p, search: value, page: 1 }));
  const handleFilterChange = (key, value) => setFilters((p) => ({ ...p, [key]: value, page: 1 }));

  const openCreate = () => {
    setFormMode('create');
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setFormMode('edit');
    setEditingEmployee(record);
    setFormOpen(true);
  };

  const openDelete = (record) => {
    setDeletingEmployee(record);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (formMode === 'create') {
        await createMutation.mutateAsync(values);
        notification.success({ message: 'Employee created successfully!' });
      } else {
        await updateMutation.mutateAsync({ id: editingEmployee._id, data: values });
        notification.success({ message: 'Employee updated successfully!' });
      }
      setFormOpen(false);
    } catch (err) {
      notification.error({ message: err?.message || 'Something went wrong. Please try again.' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(deletingEmployee._id);
      notification.success({ message: 'Employee deleted successfully.' });
      setDeleteOpen(false);
    } catch (err) {
      notification.error({ message: err?.message || 'Delete failed. Please try again.' });
    }
  };

  // ── Table Columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
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
        <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500 }}>{text}</Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text) => (
        <Tag color="cyan" style={{ borderRadius: 4 }}>{text}</Tag>
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
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Edit Employee">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              style={{ color: '#3b82f6' }}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Employee">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => openDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Card
        styles={{ body: { padding: 0 } }}
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,.05), 0 2px 4px -1px rgba(0,0,0,.03)',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        {/* Filter Controls Header */}
        <div
          style={{
            padding: '16px 20px',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Left: search + filters */}
          <Space wrap>
            <Input
              placeholder="Search by name or email..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                handleSearch(e.target.value);
              }}
              onPressEnter={() => handleSearch(searchInput)}
              style={{ width: 260, borderRadius: 8 }}
              allowClear
            />

            <Select
              placeholder={<Space><FilterOutlined /> Country</Space>}
              style={{ width: 170 }}
              allowClear
              value={filters.country}
              onChange={(val) => handleFilterChange('country', val)}
            >
              {['United States','Canada','United Kingdom','Germany','India','Australia','Singapore'].map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>

            <Select
              placeholder={<Space><FilterOutlined /> Department</Space>}
              style={{ width: 170 }}
              allowClear
              value={filters.department}
              onChange={(val) => handleFilterChange('department', val)}
            >
              {['Engineering','Product','Human Resources','Sales','Marketing','Operations'].map((d) => (
                <Option key={d} value={d}>{d}</Option>
              ))}
            </Select>
          </Space>

          {/* Right: Add Employee CTA */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              boxShadow: '0 1px 4px rgba(59,130,246,.4)',
            }}
          >
            Add Employee
          </Button>
        </div>

        {/* Data Table */}
        <Table
          columns={columns}
          dataSource={employees}
          rowKey={(r) => r._id || r.email}
          loading={isLoading || isFetching}
          locale={{
            emptyText: (
              <EmptyState
                variant={
                  filters.search || filters.country || filters.department ? 'no-results' : 'no-data'
                }
                onAction={openCreate}
              />
            ),
          }}
          pagination={{
            current: paginationMeta.page,
            pageSize: paginationMeta.limit,
            total: paginationMeta.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
            onChange: (page, pageSize) => setFilters((p) => ({ ...p, page, limit: pageSize })),
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <EmployeeForm
        open={formOpen}
        mode={formMode}
        initialValues={editingEmployee}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        open={deleteOpen}
        employee={deletingEmployee}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </>
  );
};

export default EmployeeTable;
