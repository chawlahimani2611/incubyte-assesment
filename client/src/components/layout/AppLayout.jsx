import React, { useState } from 'react';
import { Layout, Menu, Typography, theme, Button } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

/**
 * Premium App Shell Layout
 *
 * Implements a modern, responsive layout container featuring collapsible sidebar navigation,
 * custom branding header, tailored glassmorphism elements, and smooth transition states.
 */
const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Salary Dashboard',
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employee Roster',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: collapsed ? '0 8px' : '0 16px',
            background: 'rgba(255, 255, 255, 0.04)',
            overflow: 'hidden',
            transition: 'all 0.3s',
          }}
        >
          <Title
            level={4}
            style={{
              color: '#fff',
              margin: 0,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #1890ff, #722ed1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            {collapsed ? 'SM' : 'SalaryMaster'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{ borderRight: 0, padding: '8px 4px' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
              }}
            />
            <Title level={5} style={{ margin: 0, color: '#454d55', fontWeight: 600 }}>
              Enterprise Compensation Management System
            </Title>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 24px 0',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            overflow: 'initial',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
