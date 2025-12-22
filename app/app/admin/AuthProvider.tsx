'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Spin } from 'antd'

interface AdminUser {
  id: string
  username: string
  email: string | null
  role: string
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    // 如果是登录页面，不需要检查
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    // 检查登录状态
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.status === 401) {
          // 未登录，重定向到登录页
          router.push('/admin/login')
          return
        }
        const data = await res.json()
        if (data?.user) {
          setUser(data.user)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  // 登录页面不需要用户信息
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // 其他页面需要用户信息
  if (!user) {
    return null
  }

  return <>{children}</>
}

