<template>
  <div class="user-list p-25">
    <div class="user-search">
      <el-form
      :inline="true"
      :model="userSearch"
      ref="searchForm"
      >
        <el-form-item>
          <el-input v-model="userSearch.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="userSearch.email" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </el-form-item>
        <el-form-item v-if="additionSearch">
          <el-button type="default" @click="showAllList" plain>显示全部</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      v-loading="loading"
      :data="userList"
      style="width: 100%"
      border
    >
      <el-table-column
        type="index"
        label="#"
        align="center"
      >
      </el-table-column>
      <el-table-column
        prop="username"
        label="用户名"
        width="180"
        align="center"
        >
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="180"
        align="center"
        >
      </el-table-column>
      <el-table-column
        prop="phone"
        label="手机号"
        width="180"
        align="center"
        >
      </el-table-column>
      
      <el-table-column
        label="角色管理"
        header-align="center"
        align="center"
        >
        <el-table-column
          label="角色"
          header-align="center"
          align="left"
         >
          <template slot-scope="scope">
            <el-tag v-for="(item,index) in scope.row.roles" :key="index">{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          header-align="center"
          align="center"
          width="110"
        >
          <template slot-scope="scope">
            <el-button type="primary" size="mini" plain @click="openRoleDialog(scope.row, scope.$index)">配置角色</el-button>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        >
        <el-table-column
          label="注销"
          align="center"
          width="80"
        >
          <template slot-scope="scope">
            <el-button type="danger" size="mini" plain @click="deleteUser(scope.row.id, scope.$index)">注销</el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          align="center"
          width="150"
        >
          <template slot-scope="scope">
            <el-switch
              :value="scope.row.is_locked === 0"
              @change="changeUserStatus(scope.row.id, scope.$index)"
              active-text="正常"
              inactive-text="禁用">
            </el-switch>
          </template>
          
        </el-table-column>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="sizes, prev, pager, next, jumper"
        :page-size="5"
        @current-change="changePage"
        @size-change="changePageSize"
        :hide-on-single-page="true"
        :current-page.sync="currentPage"
        :page-sizes="[5, 10, 15]"
        :total="total">
      </el-pagination>
    </div>

    <!-- 配置角色模态框 -->
    <el-dialog
      title="配置角色"
      :visible.sync="roleDialogVisible"
      width="40%"
      @closed="handleDialogClosed"
      >
      <p>您正在为 [ {{settingUserInfo.username}} ] 配置角色</p>
      <p>请选择角色</p>
      <div>
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
            border>
              {{role.name}}
            </el-checkbox>
          </el-tooltip>
          
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAssignRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getAdminUserList,
  changeAdminUserStatus,
  deleteUser,
  assignRole
} from '@/api/user-manager'

import { 
  getRoleList
} from '@/api/role'

export default {
  data () {
    return {
      // 用户列表
      userList: [],
      // 分页信息
      pagination: {
        limit: 5
      },
      total: 0,
      currentPage: 1,
      loading: false,
      // 用户搜索model
      userSearch: {
        username: '',
        email: ''
      },
      additionSearch: false,
      roleDialogVisible: false,
      settingUserInfo: {},
      roleList:[],
      checkedRolesModel: []
    }
  },
  created () {
    this.getUserList()
  },
  methods:{
    // 获取用户列表
    getUserList (data) {
      this.loading = true
      getAdminUserList({
        page: this.currentPage || 1,
        limit: this.pagination.limit,
        ...data
      })
        .then(res => {
          this.userList = res.data
          this.total = res.meta.pagination.total
          this.currentPage = res.meta.pagination.current_page

          this.loading = false
        })
    },
    // 页码改变
    changePage (currentPage) {
      this.getUserList();
    },
    // pageSize被改变
    changePageSize (size) {
      this.pagination.limit = size
      this.currentPage = 1
      this.getUserList()
    },
    // 搜索用户
    onSearch () {
      if (this.userSearch.username === ''
      && this.userSearch.email === '') return
      this.getUserList({
        username: this.userSearch.username,
        email: this.userSearch.email
      })
      this.additionSearch = true
    },
    // 删除搜索条件，显示全部列表
    showAllList () {
      this.userSearch.username = ''
      this.userSearch.email = ''
      this.currentPage = 1
      this.getUserList()
      this.additionSearch = false
    },
    // 改变用户状态
    changeUserStatus (id, $index) {
      this.$confirm('请再次确认是否需要更改该用户状态？', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          changeAdminUserStatus(id)
            .then(res => {
              this.userList[$index].is_locked = res.is_lock
            })
        })
    },
    // 删除用户
    deleteUser (id, $index) {
      this.$confirm('注销即代表永久删除该用户，请确认？', '注销', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteUser(id).then(res => {
            if (res.success) {
              this.$message({
                message: res.message,
                type: 'success'
              })
              this.userList.splice($index, 1)
              this.total -= 1
            }
          })
        })
    },
    // 打开配置角色模态框
    async openRoleDialog (row, $index) {
      this.roleDialogVisible = true
      this.settingUserInfo = row
      this.settingUserInfo.$index = $index
      if (!this.roleList.length) {
        // 没有角色列表
        this.roleList = await getRoleList()
      }
      // 设置复选框组初始状态（默认选中用户本来就有的角色）
      this.checkedRolesModel = this.roleList.filter(role => {
            return row.roles.indexOf(role.name) >= 0
          }).map(role => {
            return role.id
          })
    },
    // 配置角色
    handleAssignRole () {
      const { id } = this.settingUserInfo
      assignRole(id, this.checkedRolesModel.join(','))
        .then((res) => {
          this.roleDialogVisible = false
          this.userList[this.settingUserInfo.$index].roles = res.rolenames
        })
    },
    // 配置模态框关闭的回调
    handleDialogClosed () {
      this.checkedRolesModel = []
      this.settingUserInfo = {}
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list{
  .pagination-wrapper{
    margin: 25px -10px;
  }
  .el-table{
    .el-tag{
      margin: 3px 5px 3px 0
    }
  }
}
</style>
