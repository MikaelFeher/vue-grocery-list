import Vue from 'vue'
import App from './App.vue'
import VueFire from 'vuefire'
import router from './router'
import firebase from 'firebase'
import './firebase/init'

Vue.config.productionTip = false

Vue.use(VueFire)

firebase.auth().onAuthStateChanged(user => {
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
})
