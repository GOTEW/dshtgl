<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 2.定义了高宽的 DOM 容器 -->
      <div id="main" style="width: 750px; height: 400px"></div>
    </el-card>
  </div>
</template>
<script>
// 1.引入echarts
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data () {
    return {
      // 需要合并的图表数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {},
  async mounted () {
    // 3.基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(document.getElementById('main'))
    // 获取图标折线图数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取报表数据失败')
    }
    // 4.指定图表的配置项和数据
    // .merge合并对象
    const result = _.merge(res.data, this.options)
    // var option = {
    //   title: {
    //     text: 'ECharts 入门示例'
    //   },
    //   tooltip: {},
    //   legend: {
    //     data: ['销量']
    //   },
    //   xAxis: {
    //     data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    //   },
    //   yAxis: {},
    //   series: [
    //     {
    //       name: '销量',
    //       type: 'bar',
    //       data: [5, 20, 36, 10, 10, 20]
    //     }
    //   ]
    // }

    // 5.使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  },
  methods: {},
  computed: {}
}
</script>
<style lang="less" scoped></style>
