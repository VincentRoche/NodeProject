// initial state
const state = {
  gameNumber: 0
}

// getters
const getters = {}

// actions
const actions = {}

// mutations
const mutations = {
  setGameNumber (state, { gameNumber }) {
    state.gameNumber = gameNumber
  },
  resetGameNumber (state) {
    state.gameNumber = 0
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
