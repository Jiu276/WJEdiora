import { cookies } from 'next/headers'
import { prisma } from './prisma'

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'author'

export interface AdminUser {
  id: string
  username: string
  email: string | null
  role: AdminRole
}

// Cookie 名称
const AUTH_COOKIE_NAME = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7天

// 权限定义
// 使用显式的类型，让 TS 知道数组里放的是 AdminRole，而不是字面量元组
export const PERMISSIONS: Record<string, AdminRole[]> = {
  // 文章权限
  'article:create': ['super_admin', 'admin', 'editor', 'author'],
  'article:edit:own': ['super_admin', 'admin', 'editor', 'author'],
  'article:edit:all': ['super_admin', 'admin', 'editor'],
  'article:delete': ['super_admin', 'admin'],
  'article:publish': ['super_admin', 'admin', 'editor'],
  
  // 分类权限
  'category:manage': ['super_admin', 'admin'],
  
  // 主题权限
  'theme:manage': ['super_admin', 'admin'],
  
  // 用户权限
  'user:manage': ['super_admin'],
  
  // 系统权限
  'system:settings': ['super_admin'],
  
  // 文章标题生成
  'title:generate': ['super_admin', 'admin', 'editor', 'author'],
}

export type Permission = keyof typeof PERMISSIONS

/**
 * 获取当前登录用户
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_COOKIE_NAME)?.value
    
    if (!sessionId) {
      return null
    }
    
    // 从数据库查找用户（sessionId 就是 userId）
    const admin = await prisma.admin.findFirst({
      where: {
        id: sessionId,
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    })
    
    if (!admin) {
      return null
    }
    
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role as AdminRole,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * 检查用户是否有特定权限
 */
export function hasPermission(user: AdminUser | null, permission: Permission): boolean {
  if (!user) {
    return false
  }
  
  const allowedRoles: AdminRole[] = PERMISSIONS[permission]
  return (allowedRoles as AdminRole[]).includes(user.role)
}

/**
 * 检查用户是否有特定角色之一
 */
export function hasRole(user: AdminUser | null, roles: AdminRole[]): boolean {
  if (!user) {
    return false
  }
  
  return roles.includes(user.role)
}

/**
 * 要求用户必须有特定权限，否则抛出错误
 */
export function requirePermission(user: AdminUser | null, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error('权限不足')
  }
}

/**
 * 要求用户必须有特定角色之一，否则抛出错误
 */
export function requireRole(user: AdminUser | null, roles: AdminRole[]): void {
  if (!hasRole(user, roles)) {
    throw new Error('权限不足')
  }
}

/**
 * 设置登录 session
 */
export async function setAuthSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * 清除登录 session
 */
export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

/**
 * 检查用户是否可以编辑文章
 */
export function canEditArticle(user: AdminUser | null, articleAuthor: string): boolean {
  if (!user) {
    return false
  }
  
  // super_admin, admin, editor 可以编辑所有文章
  if (hasRole(user, ['super_admin', 'admin', 'editor'])) {
    return true
  }
  
  // author 只能编辑自己的文章
  if (user.role === 'author') {
    return user.username === articleAuthor || user.id === articleAuthor
  }
  
  return false
}

