import Vue from 'vue'
import VueRouter from 'vue-router'

// import login from '@/components/login.vue'
const login = () =>
  import(/* webpackChunkName: "login_home_Welcome" */ '@/components/login.vue')
// import home from '@/components/home.vue'
const home = () =>
  import(/* webpackChunkName: "login_home_Welcome" */ '@/components/home.vue')

// import Welcome from '@/components/Welcome.vue'
const Welcome = () =>
  import(
    /* webpackChunkName: "login_home_Welcome" */ '@/components/Welcome.vue'
  )

// import Users from '@/components/user/users.vue'
const Users = () => import(/* Users" */ '@/components/user/users.vue')

// import Rights from '@/components/power/rights.vue'
const Rights = () => import(/* Rights_Roles" */ '@/components/power/rights.vue')

// import Roles from '@/components/power/Roles.vue'
const Roles = () => import(/* Rights_Roles" */ '@/components/power/Roles.vue')

// import Cate from '@/components/good/cate.vue'
const Cate = () =>
  import(/* add_cate_List_Params" */ '@/components/good/cate.vue')

// import Params from '@/components/good/Params.vue'
const Params = () =>
  import(/* add_cate_List_Params" */ '@/components/good/Params.vue')

// import List from '@/components/good/List.vue'
const List = () =>
  import(/* add_cate_List_Params" */ '@/components/good/List.vue')

// import Add from '@/components/good/add.vue'
const Add = () =>
  import(/* add_cate_List_Params" */ '@/components/good/add.vue')

// import Order from '@/components/order/Order.vue'
const Order = () => import(/* Add" */ '@/components/order/Order.vue')

// import Report from '@/components/report/Report.vue'
const Report = () => import(/* Report" */ '@/components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: login },
  {
    path: '/home',
    component: home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: List
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //    next()  放行 next('/login') 强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
