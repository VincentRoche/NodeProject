<template>
  <v-container
    fluid
    fill-height
    pa-0
  >
    <v-row no-gutters style="height:100%">
      <!-- Game number and players -->
      <v-col cols="12" md="8" lg="9" align-self="stretch">
        <v-card
          class="pa-6"
          height="100%"
          tile
          flat
        >
          <v-card-title class="headline">Game number: {{ gameNumber }}</v-card-title>
          <v-card-subtitle>Give this number to people you want to play with.</v-card-subtitle>
          <v-card-text class="mt-8">
            <p class="body-1">
              Players:
            </p>
            <div class="d-flex flex-wrap">
              <v-card
                v-for="player in this.players"
                :key="player.name"
                class="pa-2 ma-2"
                outlined
              >
                {{ player.name }}
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Game options -->
      <v-col cols="12" md="4" lg="3" align-self="stretch">
        <v-card
          class="grey lighten-3 pa-6"
          height="100%"
          tile
        >
          <v-card-title>Game options</v-card-title>
          <v-card-text>
            <!-- Max players -->
            <v-slider
              v-model="maxPlayers"
              class="pt-1"
              max="50"
              :min="Math.max(2, players.length)"
              hide-details
              label="Max players"
              thumb-label="always"
              thumb-size="24"
              :disabled="!isGameAdmin"
            >
              <template v-slot:append v-if="!isGameAdmin">
                <p class="ma-0 pt-1">{{ maxPlayers }}</p>
              </template>
            </v-slider>
            
            <!-- Number of rounds -->
            <v-slider
              v-model="rounds"
              class="pt-5"
              max="20"
              min="1"
              hide-details
              label="Rounds"
              thumb-label="always"
              thumb-size="24"
              :disabled="!isGameAdmin"
            >
              <template v-slot:append v-if="!isGameAdmin">
                <p class="ma-0 pt-1">{{ rounds }}</p>
              </template>
            </v-slider>
            
            <!-- Round duration -->
            <v-slider
              v-model="roundDuration"
              class="pt-5"
              max="60"
              min="2"
              hide-details
              label="Round duration (s)"
              thumb-label="always"
              thumb-size="24"
              :disabled="!isGameAdmin"
            >
              <template v-slot:append v-if="!isGameAdmin">
                <p class="ma-0 pt-1">{{ roundDuration }}</p>
              </template>
            </v-slider>
          </v-card-text>

          <v-card-actions class="my-6">
            <v-btn 
              x-large 
              block 
              rounded 
              color="success" 
              :disabled="!isGameAdmin || players.length < 2"
              :loading="gameStarting"
              @click="startGame"
            >
              {{ isGameAdmin ? 'Start game' : 'Waiting...' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    socket: null,
    gameNumber: 0,
    players: [],
    maxPlayers: 30,
    rounds: 5,
    roundDuration: 10,
    isGameAdmin: false,
    gameStarting: false
  }),
  async created () {
    // Leave if not logged in
    if (!this.$store.getters['session/isLoggedIn']) {
      this.$router.push('/')
      return
    }

    // Socket listeners
    this.socket = this.$store.getters['session/gameSocket']
    this.socket.on('players', (message) => {
      // Update player list
      this.players = message.map((p) => { return { name: p } })
    })
    this.socket.on('GameStart', (message) => {
      // Save game settings
      this.$store.commit('game/setGameSettings', { rounds: message.settings.rounds, roundDuration: message.settings.roundDuration })
      // Save players
      this.$store.commit('game/setPlayers', { players: message.players })
      // Start game
      this.$router.push('/round')
    })

    // Create the game if the user wants to
    if (this.$route.params.gameNumber === 'new') {
      // Create a new game and make this user admin
      this.socket.emit('hostGame')
      this.socket.on('gameNumber', (message) => {
        if (message.gameNumber) {
          this.gameNumber = message.gameNumber
          this.isGameAdmin = true
        } else {
          //  voir ce qu'on fait si ça marche pas
        }
      })
    } else {
      this.gameNumber = this.$route.params.gameNumber
      
      this.socket.emit('joinGame', { name: this.$store.state.session.username, gameNumber: this.gameNumber })

      this.socket.on('errorGameFull', () => {
        this.$router.push('/?error=errorGameFull')
      })
      this.socket.on('errorNotExist', () => {
        this.$router.push('/?error=errorNotExist')
      })
      this.socket.on('errorAlreadyStarted', () => {
        this.$router.push('/?error=errorAlreadyStarted')
      })

      // Update displayed game settings when then host edits them
      this.socket.on('settingsUpdated', (settings) => {
        this.maxPlayers = settings.maxPlayers ? settings.maxPlayers : this.maxPlayers
        this.rounds = settings.rounds ? settings.rounds : this.rounds
        this.roundDuration = settings.roundDuration ? settings.roundDuration : this.roundDuration
      })
    }

    // Join the game
    
    
  },
  async destroyed () {
    if (this.$route.path !== '/round') {
      // Leave the game
      this.socket.emit('leaveGame')
    }
  },
  watch: {
    maxPlayers () {
      this.updateSettings(1)
    },
    rounds () {
      this.updateSettings(2)
    },
    roundDuration () {
      this.updateSettings(3)
    }
  },
  methods: {
    /**
     * Start the game and send all the players to the round page
     */
    startGame () {
      this.gameStarting = true
      this.socket.emit('GameStart')
    },
    /**
     * Sends the new game settings to the server
     */
    updateSettings (setting) {
      if (this.isGameAdmin) {
        let settings = {}
        if (setting === 1) {
          settings.maxPlayers = this.maxPlayers
        } else if (setting === 2) {
          settings.rounds = this.rounds
        } else if (setting === 3) {
          settings.roundDuration = this.roundDuration
        }
        this.socket.emit('settingsUpdate', settings)
      }
    }
  }
}
</script>
