<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card class="box-card">
      <!-- 搜索区域与添加区域 -->

      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4"
          ><el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          ></el-col
        >
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="this.userList" :border="true" stripe max-height="750">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="手机"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeUserByid(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-setting"
                @click="serRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="editdialogClose"
    >
      <el-form
        :rules="editFormRules"
        :model="editForm"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserinfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户：{{ userinfo.username }}</p>
        <p>当前的角色：{{ userinfo.role_name }}</p>
        <p>
          分配新角色
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleIfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 验证邮箱的规则
    const changeEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 邮箱合法
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    // 验证手机号的规则
    const changeMobile = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      // 邮箱合法
      if (regMobile.test(value)) {
        // 邮箱合法
        return callback()
      }
      callback(new Error('请输入合法手机号'))
    }
    return {
      // 获取用户列表数据对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userList: [],
      total: 0,
      //   控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //   添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //   添加表单规则验证对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '密码长度在 6 到 15 个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: changeEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: changeMobile, trigger: 'blur' }
        ]
      },
      // 修改表单验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: changeEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: changeMobile, trigger: 'blur' }
        ]
      },
      // 修改用户对话框的展示与隐藏
      editdialogVisible: false,
      // 查询到用户信息对象
      editForm: {},
      // 监听分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要分配的角色
      userinfo: {},
      // 所有角色数据列表
      rolesList: [],
      // 已选中分配新角色的id
      selectedRoleId: '',
      // 保存编辑用户信息前的对象
      editUserFormer: {
        emailformer: '',
        mobileformer: ''
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPagw) {
      this.queryInfo.pagenum = newPagw
      this.getUserList()
    },
    // 监听switch开关状态的改变
    async userStateChange (userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
      this.getUserList()
    },
    // 监听添加用户对话框关闭的事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 添加用户逻辑代码
        const { data: res } = await this.$http.post('users', this.addForm)

        if (res.meta.status !== 201) {
          this.$message.error('添加用户成功')
        }
        this.$message.success('添加用户失败')
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 展示修改用户对话框
    async showEditDialog (value) {
      const { data: res } = await this.$http.get('users/' + value.id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editUserFormer.emailformer = res.data.email
      this.editUserFormer.mobileformer = res.data.mobile
      this.editdialogVisible = !this.editdialogVisible
    },
    // 监听修改用户信息的对话框关闭事件
    editdialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserinfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (
          !valid ||
          (this.editUserFormer.mobileformer === this.editForm.mobile &&
            this.editUserFormer.emailformer === this.editForm.email)
        ) return
        // 发起修改用户请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { mobile: this.editForm.mobile, email: this.editForm.email }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改用户失败')
        }
        // 关闭对话框
        this.editdialogVisible = false
        // 刷新列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('修改用户成功')
      })
    },
    // 根据id删除用户数据
    async removeUserByid (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串cancel
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    // 展示分配角色的对话框
    async serRole (userinfo) {
      this.userinfo = userinfo
      // 在展示对话框前获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配新角色
    async saveRoleIfo () {
      if (!this.selectedRoleId) {
        this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userinfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userinfo = {}
    }
  }
}
</script>
<style lang="less" scoped></style>
