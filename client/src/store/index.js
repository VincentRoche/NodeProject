import Vue from 'vue'
import Vuex from 'vuex'
import session from './modules/session'
import game from './modules/game'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    session,
    game
  }
})
