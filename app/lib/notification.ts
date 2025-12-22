// 统一通知系统
// 封装 Ant Design 的 notification 和 message，提供统一的错误处理和用户反馈

import { notification, message } from 'antd'
import type { NotificationPlacement } from 'antd/es/notification/interface'

/**
 * 显示成功消息
 */
export function showSuccess(msg: string, duration = 3) {
  message.success(msg, duration)
}

/**
 * 显示错误消息
 */
export function showError(msg: string, duration = 4) {
  message.error(msg, duration)
}

/**
 * 显示警告消息
 */
export function showWarning(msg: string, duration = 3) {
  message.warning(msg, duration)
}

/**
 * 显示信息消息
 */
export function showInfo(msg: string, duration = 3) {
  message.info(msg, duration)
}

/**
 * 显示加载消息（返回关闭函数）
 */
export function showLoading(msg: string = '加载中...') {
  const hide = message.loading(msg, 0)
  return hide
}

/**
 * 显示通知（右上角）
 */
export function showNotification(
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  description?: string,
  placement: NotificationPlacement = 'topRight',
  duration = 4.5
) {
  notification[type]({
    message: title,
    title: title,
    description,
    placement,
    duration,
  })
}

/**
 * 处理 API 错误并显示友好的错误消息
 */
export function handleApiError(error: any, defaultMessage = '操作失败') {
  console.error('API Error:', error)
  
  if (error?.response?.data?.error) {
    showError(error.response.data.error)
  } else if (error?.message) {
    showError(error.message)
  } else {
    showError(defaultMessage)
  }
}

/**
 * 处理成功操作
 */
export function handleSuccess(msg: string = '操作成功', callback?: () => void) {
  showSuccess(msg)
  if (callback) {
    setTimeout(callback, 1000)
  }
}


