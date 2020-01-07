import io from 'socket.io-client'

// initial state
const state = {
  sessionId: null,
  username: null,
  gameSocket: null
}

// Game socket
let gameSocket = null

// getters
const getters = {
  isLoggedIn (state) {
    return !!state.sessionId
  },
  gameSocket () {
    return gameSocket
  }
}

// actions
const actions = {}

// mutations
const mutations = {
  login (state, { sessionId, username }) {
    state.sessionId = sessionId
    state.username = username

    // Connect socket
    gameSocket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '', { query: { sessionId: sessionId } })
  },
  logout (state) {
    state.sessionId = null
    state.username = null
    gameSocket = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  gameSocket
}
