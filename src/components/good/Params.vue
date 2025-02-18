<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>列表参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert
        title="注意：只允许第三级分类设置相关参！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            v-model="selectparamsId"
            :options="paramsList"
            @change="paramsChange"
            :props="cascaderprops"
            clearable
            props.checkStrictly="true"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 选择动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many" :disabled="isBtnDisabled">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table
            :data="manyTableList"
            style="width: 100%"
            :border="true"
            stripe
            max-height="750"
          >
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 动态渲染文本框 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="tagChose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加tag输入框区域 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" width="50"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 选择静态参数的面板 -->
        <el-tab-pane label="静态属性" name="only" :disabled="isBtnDisabled">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table
            :data="onlyTableList"
            style="width: 100%"
            :border="true"
            stripe
            max-height="750"
          >
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 动态渲染文本框 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="tagChose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加tag输入框区域 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" width="50"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + this.titleText"
      :visible.sync="addDialogVisible"
      @close="addFormVisibleClose"
      width="50%"
    >
      <el-form
        :model="addForm"
        :rules="addFormRule"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="this.titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + this.titleText"
      :visible.sync="editDialogVisible"
      @close="editFormVisibleClose"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRule"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="this.titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类数据列表
      paramsList: [],
      //   用来指定级联选择器的配置对象
      cascaderprops: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   级联选择器双向绑定的值
      selectparamsId: [],
      //   默认激活的标签页
      activeName: 'many',
      //   动态参数列表
      manyTableList: [],
      // 静态参数列表
      onlyTableList: [],
      // 控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的验证规则对象
      addFormRule: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      // 控制修改参数的对话框
      editDialogVisible: false,
      // 修改参数的数据对象
      editForm: {},
      // 修改参数对话框表单验证规则
      editFormRule: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      // 判断修改参数是否和旧参数一样
      editparamsformer: ''
    }
  },
  created () {
    this.getparamsgorie()
  },
  methods: {
    // 获取商品分类
    async getparamsgorie () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      //   赋值给cateList
      this.paramsList = res.data
    },
    paramsChange () {
      // 证明选中的不是三级分类
      if (this.selectparamsId.length !== 3) {
        this.selectparamsId = []
        this.manyTableList = []
        this.onlyTableList = []
        return ''
      }
      // 证明选中的是三级分类 和所处的面板 根据id获取对应的数据
      this.getParamsList()
    },
    // 点击标签页触发事件
    handleTabClick () {
      this.getParamsList()
    },
    // 获取参数列表数据
    async getParamsList () {
      const { data: res } = await this.$http.get(
        `categories/${this.selectparamsId[2]}/attributes`,
        { params: { sel: this.activeName } }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 添加tag时控制输入框与按钮的显示切换
        item.inputVisible = false
        // 输入框内容
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableList = res.data
      }
      this.onlyTableList = res.data
    },
    // 监听添加参数对话框的关闭事件
    addFormVisibleClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return ''
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsList()
      })
    },
    // 监听修改参数对话框的关闭事件
    editFormVisibleClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 展示修改参数对话框
    async showEditDialog (attrid) {
      const { data: res } = await this.$http.get(
        `categories/${this.selectparamsId[2]}/attributes/${attrid}`,
        { params: { attr_sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message('获取参数信息失败')
      }
      this.editForm = res.data
      this.editparamsformer = res.data.attr_name
      this.editDialogVisible = true
    },
    // 点击按钮修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid || this.editForm.attr_name === this.editparamsformer) return
        const { data: res } = await this.$http.put(
          `categories/${this.selectparamsId[2]}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    // 点击按钮删除参数
    async deleteParams (id) {
      const confirmText = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmText !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(
        `categories/${this.selectparamsId[2]}/attributes/${id}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      this.getParamsList()
    },
    // 输入框失去焦点或键盘弹起触发事件
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return null
      }
      // 用户输入的内容，需要的处理操作
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      this.saveAttrvals(row)
    },
    // 点击按钮触发事件
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // $nextTick 方法作用，是当页面元素渲染完毕之后，才会调用回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除可选项事件
    tagChose (i, row) {
      // row.attr_vals.split(i, 1)
      row.attr_vals.splice(i, 1)

      this.saveAttrvals(row)
    },
    // 保存可选项的函数
    async saveAttrvals (row) {
      const { data: res } = await this.$http.put(
        `categories/${this.selectparamsId[2]}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    }
  },
  computed: {
    // 控制disabled的状态,返回boolean
    isBtnDisabled () {
      if (this.selectparamsId.length !== 3) return true
      return false
    },
    // 获取三级分类ID
    cateId () {
      if (this.selectparamsId.length === 3) return this.selectparamsId[2]
      return null
    },
    // 添加参数，动态展示标题
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
