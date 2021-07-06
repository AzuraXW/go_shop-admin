import request from '@/utils/request'

// 获取管理员列表
export function getAdminUserList(data) {
  return request({
    url: '/admin/users',
    method: 'get',
    params: { ...data }
  })
}

// 添加后台用户
export function addAdminUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

// 更改后台用户状态
export function changeAdminUserStatus(id) {
  return request({
    url: `/admin/users/${id}/lock`,
    method: 'patch'
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}/delete`,
    method: 'delete'
  })
}

// 配置用户的角色
export function assignRole(userId, roleIds) {
  return request({
    url: `/admin/users/${userId}/role/update`,
    method: 'post',
    data: {
      roleids: roleIds
    }
  })
}
