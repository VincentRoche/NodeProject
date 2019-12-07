import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Vuex from 'vuex'

import Home from './components/Home'
import NewAccount from './components/NewAccount'
import Login from './components/Login'

import store from './store'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(Vuex)

const router = new VueRouter({
  routes: [
    { path: '/login', component: Login },
    { path: '/newAccount', component: NewAccount },
    { path: '*', component: Home }
  ]
})

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
