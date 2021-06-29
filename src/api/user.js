import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/admin/me',
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}
