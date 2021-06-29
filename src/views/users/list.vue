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
          align="center"
         >
          <template slot-scope="scope">
            <el-tag v-for="(item,index) in scope.row.roles" :key="index">{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          header-align="center"
          align="center"
        >
          <el-button type="primary" size="mini" plain>配置角色</el-button>
        </el-table-column>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        >
        <el-button type="danger" size="mini" plain>注销</el-button>
        <el-button type="warning" size="mini" plain>禁用</el-button>
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
  </div>
</template>

<script>
import { getAdminUserList } from '@/api/user-manager'

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
      additionSearch: false
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
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list{
  .pagination-wrapper{
    margin: 25px -10px;
  }
}
</style>
