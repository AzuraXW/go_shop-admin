import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfo(token) {
  return request({
    url: '/admin/me',
    method: 'post'
  })
}

// 用户退出
export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}

// 获取动态路由表
export function getAsyncRoutes() {
  return request({
    url: '/admin/menus',
    method: 'get'
  })
}

// 获取邮箱验证码
export function getEmailVeifyCode(email) {
  return request({
    url: '/auth/password/reset/email/code',
    method: 'post',
    data: {
      email
    }
  })
}

// 用户更新密码
export function updatePassword(id, data) {
  return request({
    url: `/admin/users/${id}/update_pwd`,
    method: 'post',
    data
  })
}
