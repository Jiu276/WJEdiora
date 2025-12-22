'use client'

import { useState, useEffect } from 'react'
import { FloatButton } from 'antd'
import { ArrowUpOutlined } from '@ant-design/icons'

interface BackToTopProps {
  visibilityHeight?: number
  color?: string
}

export default function BackToTop({ visibilityHeight = 400, color = '#1890ff' }: BackToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop || document.body.scrollTop
      setVisible(scrolled > visibilityHeight)
    }

    window.addEventListener('scroll', toggleVisible)
    return () => window.removeEventListener('scroll', toggleVisible)
  }, [visibilityHeight])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!visible) return null

  return (
    <FloatButton
      icon={<ArrowUpOutlined />}
      type="primary"
      style={{
        right: 24,
        bottom: 24,
        width: 50,
        height: 50,
        backgroundColor: color,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
      onClick={scrollToTop}
      tooltip="Back to top"
    />
  )
}

