import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons';

/**
 * Reusable Empty State Component
 *
 * Renders contextual empty state visuals with optional CTA buttons.
 * Variants: 'no-data' | 'no-results' | 'error'
 */
const EmptyState = ({
  variant = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const config = {
    'no-data': {
      icon: <InboxOutlined style={{ fontSize: 56, color: '#d1d5db' }} />,
      defaultTitle: 'No employees found',
      defaultDescription: 'Get started by adding your first employee profile.',
      defaultAction: 'Add Employee',
    },
    'no-results': {
      icon: <SearchOutlined style={{ fontSize: 48, color: '#d1d5db' }} />,
      defaultTitle: 'No results match your search',
      defaultDescription: 'Try adjusting your filters or clearing the search query.',
      defaultAction: null,
    },
    error: {
      icon: null,
      defaultTitle: 'Failed to load data',
      defaultDescription: 'There was a problem connecting to the server. Please try again.',
      defaultAction: 'Retry',
    },
  };

  const c = config[variant];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        gap: 16,
      }}
    >
      {c.icon}
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: '#374151' }}>
              {title || c.defaultTitle}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>
              {description || c.defaultDescription}
            </p>
          </div>
        }
      >
        {(actionLabel || c.defaultAction) && onAction && (
          <Button
            type="primary"
            icon={variant === 'no-data' ? <PlusOutlined /> : null}
            onClick={onAction}
            style={{ borderRadius: 8 }}
          >
            {actionLabel || c.defaultAction}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
