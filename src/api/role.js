import request from '@/utils/request'

// 获取所有角色
export function getRoles() {
  return request({
    url: '/admin/roles',
    method: 'get'
  })
}

// 获取所有权限
export function getPermissions () {
  return request({
    url: '/admin/permissions',
    method: 'get'
  })
}

// 添加角色
export function addRole(data) {
  return request({
    url: '/admin/roles',
    method: 'post',
    data
  })
}

// 更新角色
export function updateRole(roleId, data) {
  return request({
    url: `/admin/roles/${roleId}/update`,
    method: 'post',
    data
  })
}

// 给角色分配权限
export function giveRolePermission (roleId, permissionIds) {
  return request({
    url: `/admin/roles/${roleId}/permission`,
    method: 'post',
    data: {
      permissionids: permissionIds
    }
  })
}

// 更新角色权限
export function updateRolePermission (roleId, permissionIds) {
  return request({
    url: `/admin/roles/${roleId}/permission`,
    method: 'put',
    data: {
      permissionids: permissionIds
    }
  })
}

// 删除角色
export function deleteRole(roleId) {
  return request({
    url: `/admin/roles/${roleId}/delete`,
    method: 'delete'
  })
}
