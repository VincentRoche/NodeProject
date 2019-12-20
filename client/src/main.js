import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueAxios from 'vue-axios'

import Home from './components/Home'
import NewAccount from './components/NewAccount'
import Login from './components/Login'
import Lobby from './components/Lobby'
import Round from './components/Round'

import store from './store'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(VueAxios, axios)

const router = new VueRouter({
  routes: [
    { path: '/login', component: Login },
    { path: '/newAccount', component: NewAccount },
    { path: '/lobby/:gameNumber', component: Lobby },
    { path: '/round', component: Round },
    { path: '*', component: Home }
  ]
})

new Vue({
  vuetify,
  router,
  store,
  axios,
  render: h => h(App)
}).$mount('#app')
