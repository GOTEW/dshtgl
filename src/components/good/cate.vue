<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
          <el-input
            style="width: 20%"
            v-model="Catevalue"
            clearable
            placeholder="查询分类"
          ></el-input>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border="true"
        :show-row-hover="false"
      >
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editCateDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pageNum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateRef"
        label-width="100px"
      >
        <!-- 添加分类表单 -->
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChangeed"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editCateClose"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateRule"
        ref="editCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类列表
      cateList: [],
      //   总数据条数
      total: 0,
      //   为表格定义列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模版列
          type: 'template',
          // 指定当前列使用模版名称
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模版列
          type: 'template',
          // 指定当前列使用模版名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模版列
          type: 'template',
          // 指定当前列使用模版名称
          template: 'opt'
        }
      ],
      //   控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //   添加分类表单的数据对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认添加1级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ]
      },
      //   父级分类数据列表
      parentCateList: [],
      //   用来指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      //   选中的父级id
      selectedKeys: [],
      // 监听编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑分类的对象
      editCateForm: {},
      // 编辑分类的验证规则对象
      editCateRule: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      // 查询输入框双向绑定的数据
      Catevalue: '',
      // 保存编辑前的分类名
      editCateformer: ''
    }
  },
  created () {
    this.getcategorie()
  },
  methods: {
    // 获取商品分类数据列表
    async getcategorie () {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      //   赋值给cateList
      this.cateList = res.data.result
      //   为总数据条数赋值
      this.total = res.data.total
    },
    // 监听pagesize 的改变
    handleSizeChange (pageSize) {
      this.querInfo.pagesize = pageSize
      this.getcategorie()
    },
    // 监听pagenum 的改变
    handleCurrentChange (pageNum) {
      this.querInfo.pagenum = pageNum
      this.getcategorie()
    },
    //   点击按钮,展示分类添加对话框
    showAddCateDialog () {
      // 先获取父级分类数据列表，再展示对话框
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类失败')
      }

      this.parentCateList = res.data
    },
    // 级联选择器发生变化触发
    parentCateChangeed () {
      // selectedKeys的lenght大于0，则选择了父级分类，反之没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
        return ''
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 监听对话框的关闭事件，重置表单
    addCateDialogClose () {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击按钮，添加新的分类
    addCate () {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getcategorie()
        this.addCateDialogVisible = false
      })
    },
    // 点击按钮，删除分类
    async deleteCate (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      } else {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败')
        }
        this.$message.success('删除分类成功')
        this.getcategorie()
        this.deleteDialogVisible = false
      }
    },
    // 点击编辑按钮展示编辑分类对话框
    async editCateDialog (editCateValue) {
      const { data: res } = await this.$http.get(
        'categories/' + editCateValue.cat_id
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取编辑信息失败')
      }
      this.editCateForm = res.data
      this.editCateformer = res.data.cat_name
      this.editDialogVisible = true
    },
    // 监听修改分类对话框的关闭事件
    editCateClose () {
      this.$refs.editCateFormRef.resetFields()
    },
    // 点击按钮，修改编辑分类
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        console.log(this.editCateformer === this.editCateForm.cat_name)
        if (!valid || this.editCateformer === this.editCateForm.cat_name) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑分类失败')
        }
        this.$message.success('编辑分类成功')
        this.getcategorie()
        this.editDialogVisible = false
      })
    }
  }
}
</script>
<style lang="postcss" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.el-col {
  display: flex;
  justify-content: space-between;
}
</style>
