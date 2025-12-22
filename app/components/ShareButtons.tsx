'use client'

import { Space, Button, message } from 'antd'
import { 
  WeiboOutlined, 
  WechatOutlined, 
  QqOutlined, 
  CopyOutlined,
  ShareAltOutlined 
} from '@ant-design/icons'

interface ShareButtonsProps {
  title: string
  url: string
  description?: string
  image?: string
}

export default function ShareButtons({ title, url, description, image: _image }: ShareButtonsProps) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      message.success('Link copied to clipboard')
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        message.success('Link copied to clipboard')
      } catch {
        message.error('Copy failed, please copy manually')
      }
      document.body.removeChild(textArea)
    }
  }

  const handleWeibo = () => {
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const handleWechat = () => {
    message.info('Please use WeChat to scan the QR code to share')
    // You can integrate a QR code generator library here
  }

  const handleQQ = () => {
    const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        })
      } catch {
        // 用户取消分享
      }
    } else {
      handleCopy()
    }
  }

  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <Space size="small" wrap>
      {canUseNativeShare && (
        <Button
          icon={<ShareAltOutlined />}
          onClick={handleNativeShare}
          size="small"
        >
          Share
        </Button>
      )}
      <Button
        icon={<WeiboOutlined />}
        onClick={handleWeibo}
        size="small"
        style={{ color: '#e6162d' }}
      >
        Weibo
      </Button>
      <Button
        icon={<WechatOutlined />}
        onClick={handleWechat}
        size="small"
        style={{ color: '#07c160' }}
      >
        WeChat
      </Button>
      <Button
        icon={<QqOutlined />}
        onClick={handleQQ}
        size="small"
        style={{ color: '#12b7f5' }}
      >
        QQ
      </Button>
      <Button
        icon={<CopyOutlined />}
        onClick={handleCopy}
        size="small"
      >
        Copy link
      </Button>
    </Space>
  )
}

