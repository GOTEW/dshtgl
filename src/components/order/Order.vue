<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="inputOrder">
            <el-button
              slot="append"
              icon="el-icon-search"
            ></el-button> </el-input
        ></el-col>
      </el-row>
      <!-- table表格区域 -->
      <el-table
        :data="OrderList"
        style="width: 100%"
        :border="true"
        stripe
        max-height="750"
      >
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.update_time | dateformat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showbox"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location-outline"
              @click="fnprogress"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框区域 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editaddressClose"
    >
      <el-form
        :model="editForm"
        :rules="editFormrule"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="editForm.address1"
            :options="citydat"
            :props="quergCascader"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 物流进度对话框区域 -->
    <el-dialog title="物流进度" :visible.sync="showprogress" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressList"
          :key="index"
          :timestamp="activity.ftime"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showprogress = false">取 消</el-button>
        <el-button type="primary" @click="showprogress = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
// 导入修改地址数据供级联选择器使用
import citydat from './citydata'
export default {
  data () {
    return {
      // 搜索框绑定数据
      inputOrder: '',
      //   查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      //   订单数据列表
      OrderList: [],
      // 总条数
      total: 0,
      // 控制对话框的显示与与
      editDialogVisible: false,
      // 修改地址表单数据对象
      editForm: {
        address1: '',
        address2: ''
      },
      // 修改表单验证规则对象
      editFormrule: {
        address1: [{ required: true, message: '请选择地址', trigger: 'blur' }],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ]
      },
      citydat,
      // 级联选择器配置对象
      quergCascader: {
        value: 'value',
        label: 'label',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 监听物流对话框的显示与隐藏
      showprogress: false,
      // 物流进度静态数据
      progressList: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context:
            '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context:
            '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表数据
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败')
      }
      this.OrderList = res.data.goods
      this.total = res.data.total
    },
    // 监听每页的显示多少条数据
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrdersList()
    },
    // 监听页码的改变
    handleCurrentChange (newnum) {
      this.queryInfo.pagenum = newnum
      this.getOrdersList()
    },
    // 展示修改地址对话框
    showbox () {
      this.editDialogVisible = true
    },

    // 监听修改地址对话框的关闭事件
    editaddressClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 展示物流进度对话框
    async fnprogress () {
      this.showprogress = true
      // 由于api接口无法获取信息，可使用接口文档返回的示例数据演示
      const { data: res } = await this.$http.get('/kuaidi/')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
    }
  },
  computed: {}
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
