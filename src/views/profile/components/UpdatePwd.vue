<template>
  <el-form
    ref="form"
    :model="update"
    :rules="rules"
    label-position="top"
  >
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model.trim="update.oldPassword" type="password" />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model.trim="update.newPassword" type="password" autocomplete="off" />
    </el-form-item>
    <el-form-item label="确认新密码" prop="newPasswordConfirm">
      <el-input v-model.trim="update.newPasswordConfirm" type="password" autocomplete="off" />
    </el-form-item>
    <el-form-item label="邮箱验证码" prop="emailCode">
      <el-row :gutter="10">
        <el-col :span="20">
          <el-input v-model.trim="update.emailCode" />
        </el-col>
        <el-col :span="4">
          <el-button
            type="success"
            plain
            :disabled="!isSendEmail"
            @click="getEmailCode"
          >
            {{ isSendEmail ? '获取验证码' : sendEmailVerifyCodeInterval + '秒后可再次获取' }}
          </el-button>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">更改密码</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { validPassword } from '@/utils/validate'
import { updatePassword, getEmailVeifyCode } from '@/api/user'
import { mapActions } from 'vuex'
export default {
  data() {
    // 验证新密码是否符合规范
    const checkNewPassword = (rule, value, callback) => {
      if (!(value.length >= 8 && value.length <= 14)) {
        callback(new Error('密码长度应该在 8 ~ 16 个字符之间'))
      } else if (!validPassword(value)) {
        callback(new Error('密码必须由数字和字母组成'))
      } else {
        callback()
      }
    }
    // 检查两次密码是否一致
    const checkPwdConfirm = (rule, value, callback) => {
      if (value !== this.update.newPassword) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    }
    return {
      update: {
        oldPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
        emailCode: ''
      },
      rules: {
        oldPassword: [
          { required: true, message: '旧密码不能为空', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' }
          // { validator: checkNewPassword, trigger: 'blur' }
        ],
        newPasswordConfirm: [
          { required: true, message: '请再输入一次密码', trigger: 'blur' },
          { validator: checkPwdConfirm, trigger: 'blur' }
        ],
        emailCode: [
          { required: true, message: '邮箱验证码不能为空', trigger: 'blur' }
        ]
      },
      // 发送验证码的间隔时间
      sendEmailVerifyCodeInterval: 0
    }
  },
  computed: {
    isSendEmail() {
      return this.sendEmailVerifyCodeInterval === 0
    }
  },
  methods: {
    ...mapActions({
      logout: 'user/logout'
    }),
    // 获取邮箱验证码
    getEmailCode() {
      const email = this.$store.state.user.email
      getEmailVeifyCode(email)
      this.sendEmailVerifyCodeInterval = 60
      let timer = setInterval(() => {
        if (this.sendEmailVerifyCodeInterval === 0) {
          clearInterval(timer)
          timer = null
          return
        }
        this.sendEmailVerifyCodeInterval -= 1
      }, 1000)
    },
    // 修改密码提交
    submit() {
      const userId = this.$store.state.user.userId
      console.log(this.logout)
      this.$refs.form.validate(valid => {
        if (valid) {
          updatePassword(userId, {
            'old_password': this.update.oldPassword,
            'new_password': this.update.newPassword,
            'pwd_confirm': this.update.newPasswordConfirm,
            'code': this.update.emailCode
          }).then(() => {
            this.logout().then(() => {
              this.$router.push('/login')
              this.$message({
                type: 'success',
                message: '密码更改成功，请重新登录'
              })
            })
          })
        }
      })
    }
  }
}
</script>

<style>

</style>
