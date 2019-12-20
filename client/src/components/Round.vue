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
                  :value="time / totalTime * 100"
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
                  <v-form @submit="sendPrice">
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
                  </v-form>

                  <!-- Item picture -->
                  <v-img
                    :src="imageUrl"
                    contain
                    max-height="600"
                    class="mt-4"
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
          <v-card-title>Round {{ round }} of {{ totalRounds }}</v-card-title>

          <!-- Rankings -->
          <v-card-text>
            <v-card
              class="my-2"
              outlined
              v-for="(player, index) in this.sortedPlayers"
              :key="player.id"
            >
              <v-container>
                <v-row align="center" class="flex-nowrap" no-gutters>
                  <v-col cols="2" class="text-center">
                    <v-chip>{{ index + 1 }}</v-chip>
                  </v-col>
                  <v-col>
                    <p class="mb-0 subtitle-1">{{ player.name }}</p>
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
            <v-btn dark text @click="newGame">New game with the same players</v-btn>
            <v-btn dark text @click="quit">Quit</v-btn>
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
              :key="player.id"
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
export default {
  data: () => ({
    itemName: 'Rafale',
    imageUrl: 'https://raw.githubusercontent.com/VincentRoche/NodeProject/develop/productPictures/1.jpg',
    round: 1,
    totalRounds: 5,
    estimatedPrice: '',
    answer: 0,
    answered: false,
    time: 10,
    totalTime: 10,
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
    
  },
  methods: {
    /**
     * Send to the server the price guessed by the user.
     */
    sendPrice () {
      if (this.estimatedPrice > 0) {
        this.answered = true

      }
    },
    /**
     * Changes the item to guess and resets the form.
     */
    newItem (itemName, imageUrl, round) {
      this.itemName = itemName
      this.imageUrl = imageUrl
      this.round = round
      this.estimatedPrice = ''
      this.answered = false
      this.answer = 0
      this.time = this.totalTime
    },
    /**
     * Creates a new game with the same players.
     */
    newGame () {
      this.$router.push(`/lobby/${0}`)
    },
    /**
     * Return to home page after the game has ended.
     */
    quit () {
      this.$store.commit('game/resetGameNumber')
      this.$router.push('/')
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
