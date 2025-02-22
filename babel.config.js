module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 生产环境移除console
    ...(['transform-remove-console'],
    process.env.NODE_ENV === 'production' ? ['transform-remove-console'] : []),
    // 路由懒加载的第二步，第一步是安装@babel/plugin-syntax-dynamic-import第三步把传统路由引入改为:const Foo = () => import(/* webpackChunkName: "group-foo" */ './Foo.vue')
    '@babel/plugin-syntax-dynamic-import'
  ]
}
