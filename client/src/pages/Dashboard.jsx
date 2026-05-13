import React, { useState } from 'react';
import { Typography, Row, Col, Card, Select, Skeleton, Space, Statistic } from 'antd';
import {
  GlobalOutlined,
  TeamOutlined,
  DollarOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  useSalaryByCountry,
  useSalaryByJobTitle,
  useDepartmentsSummary,
  useSalaryDistribution,
  useHeadcountByCountry,
}     from '../hooks/useInsights';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Modern curated premium color palettes for Pie and Bar components
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

/**
 * Enterprise Compensation Analytics Dashboard
 *
 * Implements an advanced, high-performance visual dashboard rendering MongoDB aggregation layers
 * inside modular responsive Recharts vectors. Features live parameter segment sync and skeleton proxies.
 */
const Dashboard = () => {
  const [selectedCountry, setSelectedCountry] = useState(undefined);

  // Invoke parallel analytics network queries
  const { data: salaryByCountryRes, isLoading: loadingCountry } = useSalaryByCountry();
  const { data: salaryByJobRes, isLoading: loadingJobs } = useSalaryByJobTitle(selectedCountry);
  const { data: deptSummaryRes, isLoading: loadingDepts } = useDepartmentsSummary();
  const { data: distRes, isLoading: loadingDist } = useSalaryDistribution();
  const { data: headcountRes, isLoading: loadingHeadcount } = useHeadcountByCountry();

  // Extract metrics safely
  const countrySalaryData = salaryByCountryRes?.data || [];
  const jobTitleData = salaryByJobRes?.data || [];
  const deptData = deptSummaryRes?.data || [];
  const distributionData = distRes?.data || [];
  const headcountData = headcountRes?.data || [];

  // Compute High-Level KPI Values
  const totalHeadcount = headcountData.reduce((acc, curr) => acc + (curr.headcount || 0), 0);
  
  // Aggregate weighted average compensation globally across available summary chunks
  const totalSalarySum = countrySalaryData.reduce(
    (acc, curr) => acc + (curr.avgSalary || 0) * (curr.headcount || 1),
    0
  );
  const globalAvgSalary = totalHeadcount > 0 ? totalSalarySum / totalHeadcount : 0;
  const totalCountriesCount = headcountData.length;

  // Custom tooltips to format monetary readouts elegantly
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(val);

      return (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '10px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Text style={{ fontWeight: 600, display: 'block', color: '#1f2937' }}>{label}</Text>
          <Text style={{ color: payload[0].fill || '#3b82f6', fontWeight: 700 }}>
            {formatted}
          </Text>
        </div>
      );
    }
    return null;
  };

  // Format distribution chart labels mapped to aggregation intervals
  const formattedDistData = distributionData.map((item) => ({
    bucket: `$${(item._id?.min / 1000).toFixed(0)}k-$${(item._id?.max / 1000).toFixed(0)}k`,
    count: item.count,
  }));

  const isAnyLoading =
    loadingCountry || loadingJobs || loadingDepts || loadingDist || loadingHeadcount;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Top Banner & Filtering Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          gap: 16,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
            Enterprise Compensation Analytics Dashboard
          </Title>
          <Paragraph type="secondary" style={{ margin: 0, marginTop: 4, fontSize: 15 }}>
            Real-time multi-dimensional statistics driven natively by MongoDB aggregation layers.
          </Paragraph>
        </div>

        <Space>
          <Text type="secondary">
            <FilterOutlined /> Segment Charts by Region:
          </Text>
          <Select
            style={{ width: 220 }}
            placeholder="Global View (All Countries)"
            allowClear
            value={selectedCountry}
            onChange={(val) => setSelectedCountry(val)}
          >
            {headcountData.map((item) => (
              <Option key={item.country} value={item.country}>
                {item.country} ({item.headcount})
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      {/* Primary KPI Card Strip */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card
            styles={{ body: { padding: '20px 24px' } }}
            style={{
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <Skeleton loading={loadingHeadcount} active paragraph={{ rows: 1 }} title={false}>
              <Statistic
                title={
                  <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                    Total Enterprise Headcount
                  </Text>
                }
                value={totalHeadcount}
                prefix={<TeamOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
                styles={{ content: { fontWeight: 700, fontSize: 28, color: '#0f172a' } }}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            styles={{ body: { padding: '20px 24px' } }}
            style={{
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <Skeleton loading={loadingCountry} active paragraph={{ rows: 1 }} title={false}>
              <Statistic
                title={
                  <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                    Global Average Compensation
                  </Text>
                }
                value={globalAvgSalary}
                precision={0}
                prefix={<DollarOutlined style={{ color: '#10b981', marginRight: 8 }} />}
                styles={{ content: { fontWeight: 700, fontSize: 28, color: '#0f172a' } }}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            styles={{ body: { padding: '20px 24px' } }}
            style={{
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <Skeleton loading={loadingHeadcount} active paragraph={{ rows: 1 }} title={false}>
              <Statistic
                title={
                  <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                    Active Regional Subdivisions
                  </Text>
                }
                value={totalCountriesCount}
                prefix={<GlobalOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />}
                styles={{ content: { fontWeight: 700, fontSize: 28, color: '#0f172a' } }}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Chart Grid Layers */}
      <Row gutter={[24, 24]}>
        {/* Salary By Country Bar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={<Text style={{ fontWeight: 600, fontSize: 16 }}>Regional Base Salary Scaling</Text>}
            style={{ borderRadius: 12, border: '1px solid #e5e7eb', height: '100%' }}
            styles={{ body: { height: 320, padding: '16px 24px' } }}
          >
            <Skeleton loading={loadingCountry} active paragraph={{ rows: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countrySalaryData} margin={{ top: 10, right: 10, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="country"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgSalary" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>

        {/* Salary By Job Title Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 600, fontSize: 16 }}>Role Compensation Benchmarks</Text>
                {selectedCountry && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Region: {selectedCountry}
                  </Text>
                )}
              </div>
            }
            style={{ borderRadius: 12, border: '1px solid #e5e7eb', height: '100%' }}
            styles={{ body: { height: 320, padding: '16px 24px' } }}
          >
            <Skeleton loading={loadingJobs} active paragraph={{ rows: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jobTitleData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="jobTitle"
                    tick={{ fontSize: 11, fill: '#334155' }}
                    width={75}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgSalary" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>

        {/* Department Summary Pie Chart */}
        <Col xs={24} lg={10}>
          <Card
            title={<Text style={{ fontWeight: 600, fontSize: 16 }}>Departmental Budget Allocations</Text>}
            style={{ borderRadius: 12, border: '1px solid #e5e7eb', height: '100%' }}
            styles={{ body: { height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
          >
            <Skeleton loading={loadingDepts} active paragraph={{ rows: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    dataKey="avgSalary"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                    label={({ department, percent }) =>
                      `${department} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    style={{ fontSize: 11, fontWeight: 500 }}
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>

        {/* Salary Distribution Histogram */}
        <Col xs={24} lg={14}>
          <Card
            title={<Text style={{ fontWeight: 600, fontSize: 16 }}>Global Compensation Distribution</Text>}
            style={{ borderRadius: 12, border: '1px solid #e5e7eb', height: '100%' }}
            styles={{ body: { height: 320, padding: '16px 24px' } }}
          >
            <Skeleton loading={loadingDist} active paragraph={{ rows: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedDistData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} width={45} />
                  <Tooltip
                    formatter={(value) => [value, 'Total Profiles Segmented']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
