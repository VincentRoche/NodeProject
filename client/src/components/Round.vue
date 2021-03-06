<template>
  <v-container
    fluid
    fill-height
    pa-0
  >
    <v-row no-gutters style="height:100%">
      <!-- Left panel -->
      <v-col cols="12" md="8" lg="9" align-self="stretch">
        <v-card
          class="pa-6"
          height="100%"
          tile
          flat
        >
          <v-container>
            <v-row no-gutters class="flex-nowrap">
              
              <!-- Item name -->
              <v-col cols="10">
                <v-card-title class="headline">What is the price of...</v-card-title>
                <v-card-subtitle class="display-1 font-regular">{{itemName}}</v-card-subtitle>
              </v-col>

              <!-- Timer -->
              <v-col align-self="end" align="right">
                <v-progress-circular
                  :rotate="-90"
                  :size="100"
                  :width="15"
                  :value="time / $store.state.game.roundDuration * 100"
                  :color="time > 3 ? 'green' : 'red'"
                  class="title"
                >
                  {{ time }}
                </v-progress-circular>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col>
                <v-card-text>

                  <!-- Price estimation form -->
                  <p class="caption mb-1">Your price estimation:</p>
                  <!--<v-form @submit="sendPrice">-->
                    <v-text-field
                      v-model="estimatedPrice"
                      label="Estimated price"
                      solo
                      required
                      autofocus
                      type="number"
                      hide-details
                      prefix="€"
                      :disabled="answered"
                    >
                    </v-text-field>
                    <v-btn 
                      color="primary"
                      block
                      @click="sendPrice"
                      :disabled="answered"
                      class="mt-2"
                    >
                      Send
                    </v-btn>
                  <!--</v-form>-->

                  <!-- Item picture -->
                  <v-img
                    :src="imageUrl"
                    contain
                    max-height="600"
                    class="mt-4"
                    v-if="imageUrl"
                  >
                    <!-- Answer overlay -->
                    <v-overlay
                      absolute
                      :value="answer"
                      class="text-center"
                    >
                      <p class="display-2">Answer:</p>
                      <p class="display-4">€ {{ answer }}</p>
                    </v-overlay>
                  </v-img>
                </v-card-text>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>

      <!-- Right panel -->
      <v-col cols="12" md="4" lg="3" align-self="stretch">
        <v-card
          class="grey lighten-3 pa-6"
          height="100%"
          tile
        >
          <!-- Round number -->
          <v-card-title>Round {{ round }} of {{ $store.state.game.rounds }}</v-card-title>

          <!-- Rankings -->
          <v-card-text>
            <v-card
              class="my-2"
              outlined
              v-for="(player, index) in this.sortedPlayers"
              :key="player.name"
            >
              <v-container>
                <v-row align="center" class="flex-nowrap" no-gutters>
                  <v-col cols="2" class="text-center">
                    <v-chip>{{ index + 1 }}</v-chip>
                  </v-col>
                  <v-col>
                    <p class="mb-0 subtitle-1">{{ player.name }} <v-chip x-small color="purple" dark v-if="lastAnswers[player.name]">{{ lastAnswers[player.name] }}</v-chip></p>
                    <p class="mb-0 subtitle-2">{{ player.score }}</p>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Final results overlay window -->
    <v-dialog v-model="showFinalResults" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Final results</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <!--<v-btn dark text @click="newGame">New game with the same players</v-btn>-->
            <v-btn dark text @click="quit">Home</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <!-- Player list -->
        <v-container>
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="4"
              lg="3"
              v-for="(player, index) in this.sortedPlayers"
              :key="player.name"
            >
              <v-card
                outlined
              >
                <v-container>
                  <v-row align="center" class="flex-nowrap" no-gutters>
                    <v-col cols="2" class="text-center">
                      <v-chip :class="podiumColors[index + 1]">{{ index + 1 }}</v-chip>
                    </v-col>
                    <v-col>
                      <p class="mb-0 subtitle-1">{{ player.name }}</p>
                      <p class="mb-0 subtitle-2">Score: {{ player.score }}</p>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
/* eslint-disable no-console */
export default {
  data: () => ({
    socket: null,
    itemName: '',
    imageUrl: '',
    round: 1,
    estimatedPrice: '',
    answer: 0,
    answered: true,
    lastAnswers: [],
    time: 0,
    players: [
      { id:0, name:'Jacques Chirac', score: 77 },
      { id:1, name:'Valéry Giscard d\'Estaing', score: 33 },
      { id:4, name:'Georges Pompidou', score: 55 }
    ],
    showFinalResults: false,
    podiumColors: {
      1: 'amber',
      2: 'grey',
      3: 'brown lighten-2'
    }
  }),
  created () {
    // Leave if not logged in
    if (!this.$store.getters['session/isLoggedIn']) {
      console.log(`Round: not logged in`)
      this.$router.push('/')
      return
    }

    // Socket listeners
    this.socket = this.$store.getters['session/gameSocket']
    this.socket.on('RoundStart', (message) => {
      console.log(`Round ${message.round} start`)
      this.newItem(message.name, message.image, message.round)
      this.ready()
    })
    this.socket.on('score', (message) => {
      this.players = message.newScore
      this.answer = message.price
      this.lastAnswers = {}
      for (const a of message.lastAnswers) {
        this.lastAnswers[a.name] = a.answer
      }
      console.log(`Updated scores`)
    })
    this.socket.on('clock', (message) => {
      this.time = message
      console.log(`Clock: ${this.time}`)
      if (message === 0 && !this.answered) {
        this.socket.emit('answer', 0)
        console.log(`Auto answer: 0`)
      }
    })
    this.socket.on('GameEnd', () => {
      console.log(`GameEnd`)
      this.showFinalResults = true
    })
    this.socket.on('kick', () => {
      console.warn(`Kicked from game.`)
      this.$store.commit('session/logout')
      this.$router.push('/')
    })

    // Fill player list
    this.players = this.$store.state.game.players.map(p => { return { name: p, score: 0 } })
  },
  async destroyed () {
    if (!this.showFinalResults && this.socket) {
      // Leave the game
      this.socket.emit('leaveGame')
      console.log(`leaveGame (Round destroyed)`)
    }
  },
  methods: {
    /**
     * Send to the server the price guessed by the user.
     */
    sendPrice () {
      if (this.estimatedPrice > 0) {
        this.answered = true
        this.socket.emit('answer', this.estimatedPrice)
        console.log(`Send answer: ${this.estimatedPrice}`)
      }
    },
    /**
     * Changes the item to guess and resets the form.
     */
    newItem (itemName, imageUrl, round) {
      this.itemName = itemName
      this.imageUrl = (process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : 'https://vincentroche-nodeproject-9.glitch.me/') + imageUrl
      this.round = round
      this.estimatedPrice = ''
      this.answered = false
      this.answer = 0
      this.lastAnswers = []
      this.time = this.$store.state.game.roundDuration
      console.log(`New item: ${this.itemName}`)
    },
    /**
     * Tell the server that the image has been displayed
     */
    ready () {
      this.socket.emit('ready')
      console.log(`Ready`)
    },
    /**
     * Creates a new game with the same players.
     */
    newGame () {
      //this.$router.push(`/lobby/${0}`)
    },
    /**
     * Return to home page after the game has ended.
     */
    quit () {
      this.$store.commit('game/reset')
      this.$router.push('/')
      console.log(`Round: quit`)
    }
  },
  computed: {
    /**
     * Players sorted by their score (the highest first)
     */
    sortedPlayers () {
      return this.players.slice(0).sort((a, b) => { return b.score - a.score })
    }
  }
}
</script>
