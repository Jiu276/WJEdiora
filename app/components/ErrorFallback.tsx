'use client'

import { Result, Button } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f5f5f5',
      }}
    >
      <Result
        status="error"
        title="Page load error"
        subTitle={
          <div>
            <p>Sorry, the page encountered an error. Please try refreshing or return to the homepage.</p>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: 16, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#1890ff' }}>Error details (development mode)</summary>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    overflow: 'auto',
                    fontSize: 12,
                  }}
                >
                  {error.toString()}
                </pre>
              </details>
            )}
          </div>
        }
        extra={[
          <Button type="primary" key="reload" icon={<ReloadOutlined />} onClick={resetErrorBoundary}>
            Retry
          </Button>,
          <Button key="home" icon={<HomeOutlined />} onClick={() => (window.location.href = '/')}>
            Back to Home
          </Button>,
        ]}
      />
    </div>
  )
}

