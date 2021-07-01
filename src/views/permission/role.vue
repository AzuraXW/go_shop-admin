<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">新建角色</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="Key" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.cn_name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description || '暂无描述' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <template v-if="scope.row.is_locked != 1">
            <el-button 
            type="primary" 
            size="small" 
            @click="handleEdit(scope)"
            >编辑</el-button>
            <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(scope)"
            >删除</el-button>
          </template>
          <span v-else>角色已被锁定，无法操作</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'新建角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="key" v-if="dialogType!=='edit'">
          <el-input v-model="role.name" placeholder="key（角色英文名称）" />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="role.cn_name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="描述"
          />
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="checkedPermissions">
            <el-checkbox
            v-for="permission in permissions"
            :key="permission.id"
            :label="permission.id">
              {{permission.cn_name}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getRoutes, 
  getRoles, 
  addRole, 
  deleteRole, 
  updateRole, 
  getPermissions,
  giveRolePermission,
  updateRolePermission
} from '@/api/role'

const defaultRole = {
  name: '',
  description: ''
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      // 权限列表
      permissions: [],
      // 权限复选框 数据model
      checkedPermissions: []
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getAllPermission()
    this.getRoles()
  },
  methods: {
    async getRoutes() {
      const res = await getRoutes()
      this.serviceRoutes = res.data
      this.routes = this.generateRoutes(res.data)
    },
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
    },

    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title

        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },

    // 拿到所有的权限列表
    getAllPermission () {
      getPermissions()
        .then(res => {
          this.permissions = res
        })
    },

    // 弹出添加角色模态框
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      this.checkedPermissions = []
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    // 弹出编辑角色模态框
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.checkedPermissions = scope.row.permission.map(item => {
        return item.id
      })
    },

    // 删除角色
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除这个角色吗?', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.id)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        // recursive child routes
        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },

    // 确认新建或编辑角色操作
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'

      if (isEdit) {
        // 编辑角色
        const res = await updateRole(this.role.id, this.role)
        if (res.success) {
          const res2 = await updateRolePermission(
            this.role.id,
            this.checkedPermissions.join(',')
          )
          if (res2.success) {
            for (let index = 0; index < this.rolesList.length; index++) {
              if (this.rolesList[index].id === this.role.id) {
                // TODO: 编辑角色后页面没更改
                this.role.permission = this.rolesList[index].permission.filter(item => {
                  return this.checkedPermissions.indexOf(item.id) >= 0
                })
                this.rolesList.splice(index, 1, Object.assign({}, this.role))
                break
              }
            }
          }
        }
      } else {
        // 新建角色
        const res = await addRole(this.role)
        if (res.success) {
          if (this.checkedPermissions.length > 0) {
              await giveRolePermission(
              res.role_id,
              this.checkedPermissions.join(',')
            )
          }
          if (res.success) {
            this.role.id = res.role_id
            this.rolesList.push(this.role)
          }
        }
      }

      const { description, name, cn_name } = this.role
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>Key: ${name}</div>
            <div>角色名称: ${cn_name}</div>
            <div>角色描述: ${description || '无描述'}</div>
          `,
        type: 'success'
      })
    },
    
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
