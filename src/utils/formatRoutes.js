function loadView(component) {
  return (resolve) => require([`@/views/${component}`], resolve)
}

export default function formatRoutes(routes, Layout) {
  const formatRoutesArr = []
  routes.forEach(route => {
    const router = {
      meta: {}
    }
    const {
      pid,
      title,
      path,
      redirect,
      component,
      keep_alive,
      icon,
      name,
      children
    } = route
    if (component === 'Layout') {
      router['component'] = Layout
    } else {
      router['component'] = loadView(component)
    }
    if (redirect !== null) {
      router['redirect'] = redirect
    }
    if (icon !== null) {
      router['meta']['icon'] = icon
    }
    if (children && children instanceof Array && children.length > 0) {
      router['children'] = formatRoutes(children)
    }
    if (name !== null) {
      router['name'] = name
    }
    router['meta']['title'] = title
    router['path'] = path
    if (pid === 0) {
      router['alwaysShow'] = true
    }
    router['meta']['noCache'] = !keep_alive
    formatRoutesArr.push(router)
  })
  // 将404页面添加到最后面
  formatRoutesArr.push({ path: '*', redirect: '/404', hidden: true })
  return formatRoutesArr
}
