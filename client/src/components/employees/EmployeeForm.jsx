import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { employeeSchema } from '../../schemas/employeeSchema';

const { Option } = Select;

/**
 * Reusable Employee Profile Editor & Creator Form Modal
 *
 * Provides a unified input surface supporting live declarative validation via shared Zod schemas.
 * Automatically synchronizes view states between clean insertion buffers and pre-filled records.
 */
const EmployeeForm = ({ open, mode = 'create', initialValues, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  // Reset or pre-fill form fields smoothly whenever dialog dependencies update
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue({
          ...initialValues,
          // Format date string safely for Ant Design DatePicker rendering
          hireDate: initialValues.hireDate ? dayjs(initialValues.hireDate) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, initialValues, form]);

  // Handle final submission validation
  const handleFinish = (values) => {
    // Format values safely matching API expectations
    const payload = {
      ...values,
      hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : undefined,
    };

    // Client-side schema double-check via Zod
    const validationResult = employeeSchema.safeParse(payload);

    if (!validationResult.success) {
      // Map issues back to Ant Design form fields cleanly
      const fieldsErrors = validationResult.error.issues.map((issue) => ({
        name: issue.path[0],
        errors: [issue.message],
      }));
      form.setFields(fieldsErrors);
      return;
    }

    onSubmit(validationResult.data);
  };

  return (
    <Modal
      title={mode === 'edit' ? 'Edit Employee Profile' : 'Add New Employee'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={mode === 'edit' ? 'Save Changes' : 'Submit'}
      cancelText="Cancel"
      width={680}
      destroyOnHidden
      styles={{
        header: {
          paddingBottom: 12,
          borderBottom: '1px solid #f3f4f6',
        },
        body: {
          paddingTop: 16,
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ currency: 'USD' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                { required: true, message: 'Please enter the employee full name' },
                { whitespace: true, message: 'Full name cannot be empty whitespace' },
              ]}
            >
              <Input placeholder="e.g. Jane Austen" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[{ type: 'email', message: 'Please provide a valid email format' }]}
              tooltip="Leave blank to auto-generate based on full name rules"
            >
              <Input placeholder="e.g. jane.austen@company.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Job Role / Title"
              name="jobTitle"
              rules={[{ required: true, message: 'Please provide a designated job title' }]}
            >
              <Input placeholder="e.g. Senior Software Engineer" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: 'Please assign a department' }]}
            >
              <Select placeholder="Select organizational unit">
                <Option value="Engineering">Engineering</Option>
                <Option value="Product">Product</Option>
                <Option value="Human Resources">Human Resources</Option>
                <Option value="Sales">Sales</Option>
                <Option value="Marketing">Marketing</Option>
                <Option value="Operations">Operations</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: 'Regional country is required' }]}
            >
              <Select placeholder="Select region">
                <Option value="United States">United States</Option>
                <Option value="Canada">Canada</Option>
                <Option value="United Kingdom">United Kingdom</Option>
                <Option value="Germany">Germany</Option>
                <Option value="India">India</Option>
                <Option value="Australia">Australia</Option>
                <Option value="Singapore">Singapore</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Base Salary"
              name="salary"
              rules={[
                { required: true, message: 'Annual salary is required' },
                {
                  validator: (_, value) =>
                    value > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error('Salary must be positive')),
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g. 120000"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Hire Date"
              name="hireDate"
              rules={[{ required: true, message: 'Initial hire date mapping is required' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EmployeeForm;
