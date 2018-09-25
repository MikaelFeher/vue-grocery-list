import Vue from 'vue';
import Router from 'vue-router';
import Login from './components/Login.vue'
import MainPage from './components/MainPage.vue'
import firebase from 'firebase'

Vue.use(Router);

const router = new Router({
  base: '/vue-grocery-list/',
  mode: 'history',
  routes: [
    {
      path: '/index.html',
      name: 'MainPage',
      component: MainPage,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '*',
      redirect: '/login'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const currentUser = firebase.auth().currentUser
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if(requiresAuth && !currentUser) next('/login')
  else if(!requiresAuth && currentUser) next('/index.html')
  else next()
})

export default router