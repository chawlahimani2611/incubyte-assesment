import React from 'react';
import { Modal, Typography, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

/**
 * Reusable Deletion Warning Dialog
 *
 * Prompts user confirmation prior to firing unrecoverable record drop directives.
 * Displays critical target details transparently inside high-visibility alert boundaries.
 */
const DeleteConfirmation = ({ open, employee, onConfirm, onCancel, loading }) => {
  if (!employee) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
          <ExclamationCircleOutlined />
          <span>Remove Employee Record</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      confirmLoading={loading}
      okText="Yes, Delete"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
      width={480}
      destroyOnHidden
    >
      <div style={{ padding: '12px 0' }}>
        <Paragraph style={{ fontSize: 15 }}>
          Are you absolutely sure you want to permanently delete the following employee profile?
        </Paragraph>

        <Alert
          type="error"
          title={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Text style={{ fontWeight: 600, fontSize: 15 }}>{employee.fullName}</Text>
              {employee.email && <Text type="secondary">{employee.email}</Text>}
            </div>
          }
          style={{ marginTop: 12, borderRadius: 8 }}
        />

        <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 13, marginBottom: 0 }}>
          This operation is unrecoverable and immediately clears corresponding compensation matrix vectors across database aggregates.
        </Paragraph>
      </div>
    </Modal>
  );
};

export default DeleteConfirmation;
