<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisibleRole = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" stripe :border="true" max-height="750">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              class="vcenter"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  class="vcenter"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="380">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRole(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleterole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框区域 -->
    <el-dialog
      title="添加角色"
      :visible.sync="dialogVisibleRole"
      width="50%"
      @close="roleClose"
    >
      <el-form :model="addRoleForm" :rules="roleRules" ref="ruleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="addrole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框区域 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="editroleClose"
    >
      <el-form :model="editrole" :rules="roleRules" ref="editruleFormRef">
        <el-form-item label="角色ID">
          <el-input v-model="editrole.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editrole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editrole.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleinfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形空间 -->
      <el-tree
        :data="rightlist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 获取角色列表数据
      rolelist: [],
      //   添加角色表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      //   展示与隐藏添加角色对话课
      dialogVisibleRole: false,
      //   添加角色的表单验证规则
      roleRules: {
        roleName: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          {
            min: 4,
            max: 10,
            message: '长度在 4 到 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      // 监听修改角色对话框的显示与隐藏
      editdialogVisible: false,
      //   修改角色的表单数据
      editrole: [],
      // 控制权限分配的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightlist: [],
      // 树形控件属性的绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认展开的数组
      defKeys: [],
      // 角色授权id
      roleId: '',
      // 点击编辑按钮保存编辑前的旧数据
      editRoleformer: {
        roleDescformer: '',
        roleNameformer: ''
      }
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolelist = res.data
    },
    //   重置添加表单验证
    roleClose () {
      this.$refs.ruleFormRef.resetFields()
    },
    // 重置修改角色表单验证
    editroleClose () {
      this.$refs.editruleFormRef.resetFields()
    },
    // 点击确认按钮提交添加角色数据
    addrole () {
      this.$refs.ruleFormRef.validate(async valite => {
        if (!valite) return
        // 发起请求
        const { data: res } = await this.$http.post('roles', {
          roleName: this.addRoleForm.roleName,
          roleDesc: this.addRoleForm.roleDesc
        })
        if (res.meta.status !== 200) {
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.dialogVisibleRole = !this.dialogVisibleRole
        this.getRoleList()
      })
    },
    // 展示编辑角色对话框
    async editRole (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败')
      }
      this.editrole = res.data
      this.editRoleformer.roleDescformer = res.data.roleDesc
      this.editRoleformer.roleNameformer = res.data.roleName
      this.editdialogVisible = !this.editdialogVisible
    },
    // 监听修改角色对话框隐藏
    editRoleinfo () {
      this.$refs.editruleFormRef.validate(async valite => {
        if (
          !valite ||
          (this.editRoleformer.roleDescformer === this.editrole.roleDesc &&
            this.editRoleformer.roleNameformer === this.editrole.roleName)
        ) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editrole.roleId,
          { roleName: this.editrole.roleName, roleDesc: this.editrole.roleDesc }
        )
        if (res.meta.status !== 200) {
          return this.$menubar.error('修改角色失败')
        }
        this.editdialogVisible = !this.editdialogVisible
        this.$message.success('修改角色成功')
        this.getRoleList()
      })
    },
    // 删除角色
    async deleterole (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //   假如confirmResult 返回值是confirm 确认删除
      //   假如confirmResult 返回值是confirm 确认删除
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败')
        this.$message.success('删除角色成功')
        this.getRoleList()
      }
    },
    // 根据id删除对应权限
    async removeRightById (role, rightid) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightid}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有权限数据失败')
      }
      // 把获取到的权限数据保存到data中
      this.rightlist = res.data
      console.log(this.rightlist)
      // 递归获取三节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = !this.setRightDialogVisible
    },
    // 通过递归的形式，获取角色下三级权限的id，并保存到defkeys数组中
    getLeafKeys (node, arr) {
      // 如果当前的node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击确定按钮为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('角色授权失败')
      }
      this.$message.success('授权成功')
      this.getRoleList()
      this.setRightDialogVisible = !this.setRightDialogVisible
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
