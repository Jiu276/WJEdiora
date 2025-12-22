'use client'

import { useEffect } from 'react'
import { Result, Button } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

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
              <details style={{ marginTop: 16, textAlign: 'left', maxWidth: 600 }}>
                <summary style={{ cursor: 'pointer', color: '#1890ff' }}>Error details (development mode)</summary>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: '#fff',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    overflow: 'auto',
                    fontSize: 12,
                    maxHeight: 300,
                  }}
                >
                  {error.message}
                  {error.stack && (
                    <>
                      {'\n\n'}
                      {error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        }
        extra={[
          <Button type="primary" key="reload" icon={<ReloadOutlined />} onClick={reset}>
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

