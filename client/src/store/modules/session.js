// initial state
const state = {
  sessionId: null,
  user: null
}

// getters
const getters = {
  isLoggedIn (state) {
    return !!state.sessionId
  }
}

// actions
const actions = {}

// mutations
const mutations = {
  logout (state) {
    state.sessionId = null
    state.user = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
