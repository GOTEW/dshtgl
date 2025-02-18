<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 进度条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTableave"
          @tab-click="tabclicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <template>
                <el-cascader
                  expand-trigger="hover"
                  :options="cateList"
                  v-model="addForm.goods_cat"
                  @change="handleCateChange"
                  :props="setcascaderInfo"
                >
                </el-cascader>
              </template>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item1"
                  v-for="(item1, i) in item.attr_vals"
                  :key="i"
                  :border="true"
                >
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableDate"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action上传图片到后台API的地址 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="uploadimg"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器区域 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品区域 -->
            <el-button type="primary" class="Addbtn" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览区域 -->
    <el-dialog title="图片预览" :visible.sync="showdialog" width="50%">
      <img :src="PreviewPath" class="preview" />
    </el-dialog>
  </div>
</template>
<script>
// 导入lodash
import _ from 'lodash'
export default {
  data () {
    return {
      // 进度条和tab栏默认显示项
      activeIndex: '0',
      //   添加商品表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 1,
        goods_number: 1,
        goods_weight: 1,
        //   级联选择器选中绑定的值
        goods_cat: [],
        // 图片的信息
        pics: [],
        // 商品信息
        goods_introduce: '',
        // 商品的参数
        attrs: []
      },
      // 表单验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          },
          { type: 'number', message: '价格必须为数字值' }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          },
          { type: 'number', message: '数量必须为数字值' }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          },
          { type: 'number', message: '重量必须为数字值' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      //   商品分类列表数组
      cateList: [],

      //   级联选择器的配置对象
      setcascaderInfo: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   商品动态参数列表数组
      manyTableData: [],
      //   商品静态参数列表数组
      onlyTableDate: [],
      //   为图片上传herders添加token
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 控制预览图片的显示与隐藏
      showdialog: false,
      // 图片预览地址
      PreviewPath: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 当选中项变化 触发事件
    handleCateChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 切换tabs选项前调用事件 返回值作为属性值
    beforeTableave (activeName, oldActiveName) {
      if (activeName !== '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 获取商品参数列表
    async tabclicked () {
      if (this.activeIndex === '1' && this.addForm.goods_cat.length === 3) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品动态参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品静态参数列表失败')
        }
        this.onlyTableDate = res.data
      }
    },
    // 图片预览操作
    handlePreview (file) {
      this.PreviewPath = file.response.data.url
      this.showdialog = true
    },
    // 点击移除图片时的操作
    handleRemove (file) {
      // 1.找到删除图片的暂存地址
      const path = file.response.data.tmp_path
      // 2.找到path在pics数组中的索引
      const i = this.addForm.pics.findIndex(x => x.pic === path)

      // 3.使用splice方法删除图片
      this.addForm.pics.splice(i, 1)
    },
    // 上传图片保存图片暂存地址
    uploadimg (response) {
      const pic = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(pic)
    },
    // 添加商品
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写完相关表单项')
        }
        // 添加商品逻辑操作
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newinfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newinfo)
        })
        // 处理静态参数
        this.onlyTableDate.forEach(item => {
          const newinfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newinfo)
        })
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 计算获取三级商品分类id
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style>
.el-steps {
  margin: 15px 0;
}
.el-step__title {
  font-size: 13px !important;
}
.el-checkbox.is-bordered {
  margin: 0 10px 0 0 !important;
}
.preview {
  width: 100%;
}
.ql-editor {
  min-height: 300px;
}
.Addbtn {
  margin-top: 15px !important;
}
</style>
