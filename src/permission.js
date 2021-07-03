import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // 开启页面进度条
  NProgress.start()

  // 设置标题
  document.title = getPageTitle(to.meta.title)

  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // 已登录，跳转到: '/'
      next({ path: '/' })
      NProgress.done() // 关闭页面进度条
    } else {
      // 是否通过用户信息拿到角色信息
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        // 登录过并且有角色信息，直接进入下一个路由
        next()
      } else {
        try {
          // 获取用户信息
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          await store.dispatch('user/getInfo')

          // 根据角色生成路由表
          const accessRoutes = await store.dispatch('permission/generateRoutes')
          // 动态添加路由
          router.addRoutes(accessRoutes)

          next({ ...to, replace: true })
        } catch (error) {
          console.log(error)
          // 清除token，跳转登录页
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // 访问的路径处于白名单中
      next()
    } else {
      // 没有登录，跳转登录页
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
