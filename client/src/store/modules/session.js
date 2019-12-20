const io = require('socket.io-client')

// initial state
const state = {
  sessionId: null,
  user: null,
  gameSocket: null
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
  login (state, sessionId, user) {
    state.sessionId = sessionId
    state.user = user

    // Connect socket
    const socketAddress = 'ws://localhost:8080'
    this.socket = io(socketAddress)
  },
  logout (state) {
    state.sessionId = null
    state.user = null
    state.gameSocket = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
