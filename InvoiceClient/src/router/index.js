import Vue from 'vue'
import Router from 'vue-router'
import Registration from '@/components/Registration'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import AdminBoard from '@/components/AdminBoard'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Default',
      component: Login
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/adminboard',
      name: 'AdminBoard',
      component: AdminBoard
    }
  ]
})
