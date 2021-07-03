import request from '@/utils/request'

// 获取菜单列表
export function getMenuList() {
  return request({
    url: '/admin/menus/list',
    method: 'get'
  })
}

// 获取菜单列表
export function componentCache(id) {
  return request({
    url: `/admin/menus/${id}/cache`,
    method: 'post'
  })
}

// 获取菜单列表
export function giveMenuRoles(id, roleIds) {
  return request({
    url: `/admin/menus/${id}/giveRole`,
    method: 'post',
    data: {
      roleIds
    }
  })
}
