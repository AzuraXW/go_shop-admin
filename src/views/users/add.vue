<template>
  <div class="add-user-form p-25">
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      :rules="rules"
    >
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          show-password
          @input="onPwdInput"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="password_confirmation">
        <el-input
          v-model="form.password_confirmation"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-checkbox
          v-model="form.defaultPwdChecked"
          @change="onDefaultPWD"
        >启用默认密码</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">添加</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { addAdminUser } from '@/api/user-manager'
import { validEmail } from '@/utils/validate'

export default {
  data() {
    // 邮箱字段验证函数
    const validEmailField = (rule, value, callback) => {
      if (!validEmail(value)) {
        callback(new Error('邮箱格式不正确'))
      } else {
        callback()
      }
    }
    // 确认密码字段验证函数
    const validPWDConirm = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    }
    return {
      form: {
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        defaultPwdChecked: false
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validEmailField, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        password_confirmation: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validPWDConirm, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onDefaultPWD(newVal) {
      if (newVal === true) {
        this.form.password = '123456'
      } else {
        this.form.password = ''
      }
    },
    onPwdInput() {
      if (this.form.defaultPwdChecked === true) {
        this.form.defaultPwdChecked = false
      }
    },
    // 表单提交
    onSubmit() {
      this.$refs.form.validate()
        .then(valid => {
          if (valid) {
            // 表单验证通过
            console.log('验证成功')
            addAdminUser(this.form)
              .then(res => {
                if (res.success) {
                  // this.$router.push({name: 'AdminUserList'})
                }
              })
          }
        }).catch(() => {
          this.$message({
            message: '表单验证不通过',
            type: 'warning'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.add-user-form{
  display: flex;
  justify-content: center;
  .el-form{
    width: 50%;
    margin-top: 10%;
  }
}
</style>
