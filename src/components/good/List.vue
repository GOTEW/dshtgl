<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryIofo.query"
            class="input-with-select"
            clearable
            @clear="getgoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getgoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goaddgoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table商品列表区域 -->
      <el-table :data="goodsList" :border="true" stripe max-height="750">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格(元)"
          width="95"
        ></el-table-column>
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="70"
        ></el-table-column>
        <el-table-column label="创建时间" width="140">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateformat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deletegoods(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryIofo.pagenum"
        :page-sizes="[10, 50, 150, 200]"
        :page-size="queryIofo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryIofo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      //   商品总数
      total: 0,
      //   商品列表对象
      goodsList: []
    }
  },
  created () {
    this.getgoodsList()
  },
  methods: {
    // 根据分类获取商品列表数据
    async getgoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryIofo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听pageSize的变化
    handleSizeChange (size) {
      this.queryIofo.pagesize = size
      this.getgoodsList()
    },
    // 监听pagenum的变化
    handleCurrentChange (num) {
      this.queryIofo.pagenum = num
      this.getgoodsList()
    },
    // 点击按钮删除操作
    async deletegoods (row) {
      const confirminfo = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirminfo !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('goods/' + row.goods_id)
      if (res.meta.status !== 200) {
        this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getgoodsList()
    },
    // 点击添加商品按钮跳转到add组件
    goaddgoods () {
      this.$router.push('goods/add')
    }
  },
  computed: {}
}
</script>
<style lang="less" scoped></style>
