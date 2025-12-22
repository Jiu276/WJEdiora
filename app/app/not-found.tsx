import { Result, Button } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

export default function NotFound() {
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
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" icon={<HomeOutlined />} href="/">
            Back to Home
          </Button>
        }
      />
    </div>
  )
}

