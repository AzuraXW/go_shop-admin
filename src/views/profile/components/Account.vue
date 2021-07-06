<template>
  <el-row :gutter="30">
    <el-col :span="6">
      <el-upload
        class="avatar-uploader"
        action="https://jsonplaceholder.typicode.com/posts/"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleChange"
      >
        <img v-if="avatarUrl" :src="avatarUrl" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon" />
      </el-upload>
      <el-button type="primary" style="width: 100%; margin-top: 7px" @click="uploadAvatar">更新头像</el-button>
    </el-col>
    <el-col :span="16">
      <el-form>
        <el-form-item label="用户名">
          <el-input v-model.trim="user.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model.trim="user.phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">更新</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import { updateAvatar } from '@/api/user'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          phone: ''
        }
      }
    }
  },
  data() {
    return {
      avatarUrl: '',
      avatarFileRaw: null
    }
  },
  methods: {
    submit() {
      this.$message({
        message: 'User information has been updated successfully',
        type: 'success',
        duration: 5 * 1000
      })
    },
    // 文件预览
    handleChange(file) {
      const isJPG = file.raw.type === 'image/jpeg'
      const isLt2M = file.raw.size / 1024 < 200

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
        return
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 200KB!')
        return
      }

      this.avatarUrl = URL.createObjectURL(file.raw)
      this.avatarFileRaw = file.raw
    },
    // 上传头像
    uploadAvatar() {
      if (this.avatarFileRaw === null) return
      const userId = this.$store.state.user.userId
      const formData = new FormData()
      formData.set('avatar', this.avatarFileRaw)
      updateAvatar(userId, formData).then(res => {
        if (res.success) {
          this.$store.commit('user/SET_AVATAR', res.avatar_url)
          this.avatarUrl = ''
          this.avatarFileRaw = null
          this.$message({
            type: 'success',
            message: res.message
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.avatar-uploader .el-upload {
    width: 100%;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 100%;
    height: 150px;
    display: block;
  }
</style>
