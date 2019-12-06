import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify'

import Home from './components/Home'
import NewAccount from './components/NewAccount'
import Login from './components/Login'

Vue.config.productionTip = false

Vue.use(VueRouter)

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
  render: h => h(App)
}).$mount('#app')
