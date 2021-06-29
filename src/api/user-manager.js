import request from '@/utils/request'

export function getAdminUserList(data) {
  return request({
    url: '/admin/users',
    method: 'get',
    params: { ...data }
  })
}

export function addAdminUser (data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}