'use client'

import { useEffect } from 'react'
import { Result, Button } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
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
            title="Application load error"
            subTitle="Sorry, the application encountered a critical error. Please try refreshing the page."
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
      </body>
    </html>
  )
}

