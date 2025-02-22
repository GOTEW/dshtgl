const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 设置打包入口文件
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js'),
        // 设置cdn加载
        config.set('externals', {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          axios: 'axios',
          lodash: '_',
          echarts: 'echarts',
          nprogress: 'NProgress',
          'vue-quill-editor': 'VueQuillEditor'
        })
      // 在html插件 args拿到插件配置.添加isprod这个布尔值
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })

    })
  }
})
