<template>
  <div class="menus-page p-25">
    <el-table
      :data="menus"
      style="width: 100%;margin-bottom: 20px;"
      row-key="id"
      border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column
        prop="title"
        type="index"
        label="#"
        width="50"
        align="center"
      />
      <el-table-column
        prop="title"
        label="标题"
      />
      <el-table-column
        prop="keep_alive"
        label="是否缓存组件"
      >
        <template slot-scope="scope">
          <el-switch
            :value="scope.row.keep_alive === 1"
            active-text="是"
            inactive-text="否"
            @change="changeCache(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="path"
        label="路径"
      />
      <el-table-column
        label="配置角色访问路由权限"
      >
        <template slot-scope="scope">
          <el-button
            plain
            type="primary"
            size="mini"
            @click="showMenuRoleDialog(scope.row)"
          >分配</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="配置角色访问路由权限"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
    >
      <div class="assign-menu-role">
        <p>菜单信息</p>
        <div class="menu-info">
          <span>标题：{{ route.title }}</span>
          <span>路径：{{ route.path }}</span>
        </div>
        <div>
          <p>请选择可以访问该路由的角色：</p>
          <el-checkbox-group v-model="checkedRolesModel">
            <el-tooltip
              v-for="role in roleList"
              :key="role.id"
              effect="dark"
              :content="role.cn_name"
              placement="bottom"
            >
              <el-checkbox
                :label="role.id"
                border
              >
                {{ role.name }}
              </el-checkbox>
            </el-tooltip>
          </el-checkbox-group>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateMenuRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getMenuList, componentCache, giveMenuRoles } from '@/api/menu'
import { getRoleList } from '@/api/role'
export default {
  data() {
    return {
      menus: [],
      route: {},
      roleList: [],
      checkedRolesModel: [],
      dialogVisible: false
    }
  },
  created() {
    this.getMenus()
    getRoleList().then(roles => {
      this.roleList = roles
    })
  },
  methods: {
    getMenus() {
      getMenuList().then(menus => {
        this.menus = menus.data
      })
    },
    // 打开模态框（为路由分配角色访问权限）
    showMenuRoleDialog(row) {
      this.route = row
      this.dialogVisible = true
      console.log(row)
      this.checkedRolesModel = row.roles.map(role => {
        return role.id
      })
    },
    handleClose() {

    },
    // 更改组件缓存状态
    changeCache(row) {
      componentCache(row.id).then(res => {
        row.keep_alive = res.keep_alive
      })
    },
    // 更新可以访问菜单的角色
    updateMenuRoles() {
      giveMenuRoles(this.route.id, this.checkedRolesModel.join(','))
        .then((res) => {
          this.route.roles = this.roleList.filter(role => {
            return this.checkedRolesModel.indexOf(role.id) >= 0
          })
          this.dialogVisible = false
          this.$message({
            type: 'success',
            message: res.message
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.menus-page{
  .assign-menu-role{
    p{
        font-size: 16px;
      }
    .menu-info{
      span{
        display: inline-block;
        margin-right: 25px;
      }
    }
  }
}
</style>
