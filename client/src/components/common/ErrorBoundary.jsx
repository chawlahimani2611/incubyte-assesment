import React from 'react';
import { Result, Button, Typography } from 'antd';
import { BugOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

/**
 * Global Error Boundary
 *
 * Catches unhandled React render errors anywhere in the component tree and
 * presents a user-friendly fallback UI instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production you would send to an error tracking service here
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught unhandled error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '40px 24px',
          }}
        >
          <Result
            icon={<BugOutlined style={{ color: '#ef4444' }} />}
            title="Something went wrong"
            subTitle="An unexpected error occurred in this section of the application."
            extra={[
              <Button
                key="reload"
                type="primary"
                onClick={() => window.location.reload()}
                style={{ marginRight: 8 }}
              >
                Reload Page
              </Button>,
              <Button key="retry" onClick={this.handleReset}>
                Try Again
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div
                style={{
                  textAlign: 'left',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginTop: 16,
                }}
              >
                <Paragraph style={{ margin: 0, fontWeight: 600, color: '#dc2626' }}>
                  {this.state.error.toString()}
                </Paragraph>
                {this.state.errorInfo && (
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, whiteSpace: 'pre-wrap', display: 'block', marginTop: 8 }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
