/* eslint-disable no-console */
// initial state
const state = {
  rounds: 0,
  roundDuration: 0,
  players: []
}

// getters
const getters = {}

// actions
const actions = {}

// mutations
const mutations = {
  setGameSettings (state, { rounds, roundDuration }) {
    console.log(`Vuex game setGameSettings: ${rounds}, ${roundDuration}`)
    state.rounds = rounds
    state.roundDuration = roundDuration
  },
  setPlayers (state, { players }) {
    console.log(`Vuex game setPlayers: ${players}`)
    state.players = players
  },
  reset (state) {
    console.log(`Vuex game reset`)
    state.gameNumber = 0
    state.rounds = 0
    state.roundDuration = 0
    state.players = 0
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
