import Vue from 'vue';
import Router from 'vue-router';
import Login from './components/Login.vue'
import MainPage from './components/MainPage.vue'

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'MainPage',
      component: MainPage
    }
  ]
})