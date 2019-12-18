import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify'

import Home from './components/Home'
import NewAccount from './components/NewAccount'
import Login from './components/Login'
import Lobby from './components/Lobby'

import store from './store'

Vue.config.productionTip = false

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/login', component: Login },
    { path: '/newAccount', component: NewAccount },
    { path: '/lobby/:gameNumber', component: Lobby },
    { path: '*', component: Home }
  ]
})

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
