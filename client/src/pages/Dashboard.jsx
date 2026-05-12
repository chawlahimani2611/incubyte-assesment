import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

/**
 * Placeholder Dashboard Page
 *
 * Salary Insights Dashboard implementation scheduled for Commit 12.
 */
const Dashboard = () => {
  return (
    <div>
      <Title level={2}>Salary Insights Dashboard</Title>
      <Paragraph>
        Welcome to the enterprise compensation analytics control center. Real-time aggregation charts and interactive histograms will be deployed here.
      </Paragraph>
      <Card title="System Notice" style={{ marginTop: 16 }}>
        <Paragraph style={{ margin: 0 }}>
          Interactive dashboard visualizers powered by Recharts are currently scheduled for development in Commit 12. Use the sidebar to view the Employee Roster.
        </Paragraph>
      </Card>
    </div>
  );
};

export default Dashboard;
