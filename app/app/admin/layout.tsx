'use client'

import { Layout, Menu, Button, Drawer, Dropdown } from 'antd'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  DashboardOutlined,
  FileTextOutlined,
  TagsOutlined,
  AppstoreOutlined,
  HomeOutlined,
  MenuOutlined,
  SkinOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import type { MenuProps } from 'antd'
import AuthProvider from './AuthProvider'

const { Header, Sider, Content } = Layout
const MOBILE_BREAKPOINT = 992

interface AdminUser {
  id: string
  username: string
  email: string | null
  role: string
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)

  // 所有 hooks 必须在条件返回之前调用
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // 如果是登录页面，不需要获取用户信息
    if (pathname === '/admin/login') {
      return
    }
    
    // 获取当前用户信息
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
        }
      })
      .catch((error) => {
        console.error('Get user error:', error)
      })
  }, [pathname])

  // 如果是登录页面，不显示布局（在所有 hooks 调用之后）
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 'bold' }}>{user?.username}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {user?.role === 'super_admin' && '超级管理员'}
            {user?.role === 'admin' && '管理员'}
            {user?.role === 'editor' && '编辑'}
            {user?.role === 'author' && '作者'}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  // 根据角色过滤菜单项
  const getMenuItems = () => {
    const items: MenuProps['items'] = []

    // 仪表盘始终保留在首位
    items.push({
        key: '/admin',
        icon: <DashboardOutlined />,
        label: <Link href="/admin">仪表盘</Link>,
    })

    // 发布流程优先：标题生成 → 文章管理
    items.push(
      {
        key: '/admin/article-titles',
        icon: <AppstoreOutlined />,
        label: <Link href="/admin/article-titles">文章标题</Link>,
      },
      {
        key: '/admin/articles',
        icon: <FileTextOutlined />,
        label: <Link href="/admin/articles">文章管理</Link>,
      }
    )

    // 只有 super_admin 和 admin 可以管理分类、审核、主题
    if (user && ['super_admin', 'admin'].includes(user.role)) {
      items.push(
        {
          key: '/admin/categories',
          icon: <TagsOutlined />,
          label: <Link href="/admin/categories">标签类别</Link>,
        },
        {
          key: '/admin/categories/review',
          icon: <TagsOutlined />,
          label: <Link href="/admin/categories/review">标签审核</Link>,
        },
        {
          key: '/admin/themes',
          icon: <SkinOutlined />,
          label: <Link href="/admin/themes">主题管理</Link>,
        }
      )
    }

    // 只有 super_admin 可以管理用户
    if (user && user.role === 'super_admin') {
      items.push({
        key: '/admin/users',
        icon: <TeamOutlined />,
        label: <Link href="/admin/users">用户管理</Link>,
      })
    }

    return items
  }

  const sidebarContent = (
    <>
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ margin: 0 }}>Ediora</h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>管理后台</p>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname || '/admin']}
        items={getMenuItems()}
        style={{ height: '100%', borderRight: 0 }}
        onClick={() => setDrawerOpen(false)}
      />
      <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
        <Link href="/" style={{ color: '#666' }} onClick={() => setDrawerOpen(false)}>
          <HomeOutlined /> 返回首页
        </Link>
      </div>
    </>
  )

  const contentStyle = isMobile
    ? { margin: '16px', padding: '16px', background: '#fff', minHeight: 280 }
    : { margin: '24px', padding: '24px', background: '#fff', minHeight: 280 }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider width={220} theme="light">
          {sidebarContent}
        </Sider>
      )}
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                aria-label="打开菜单"
              />
            )}
            <h1 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px' }}>Ediora 内容管理系统</h1>
          </div>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{user.username}</span>
              </Button>
            </Dropdown>
          )}
        </Header>
        <Content style={contentStyle}>
          {children}
        </Content>
      </Layout>
      {isMobile && (
        <Drawer
          placement="left"
          closable
          width={260}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          bodyStyle={{ padding: 0 }}
        >
          {sidebarContent}
        </Drawer>
      )}
    </Layout>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
}
