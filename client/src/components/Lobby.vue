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
          <v-card-title class="headline">Game number: {{gameNumber}}</v-card-title>
          <v-card-subtitle>Give this number to people you want to play with.</v-card-subtitle>
          <v-card-text class="mt-8">
            <p class="body-1">
              Players:
            </p>
            <div class="d-flex flex-wrap">
              <v-card
                v-for="player in this.players"
                :key="player.id"
                class="pa-2 ma-2"
                outlined
              >
                {{player.name}}
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
              class="align-center"
              max="50"
              :min="Math.max(2, players.length)"
              hide-details
              label="Max players"
              :disabled="!isGameAdmin"
            >
              <template v-slot:append>
                <v-text-field
                  v-model="maxPlayers"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 50px"
                ></v-text-field>
              </template>
            </v-slider>
            
            <!-- Number of rounds -->
            <v-slider
              v-model="rounds"
              class="align-center"
              max="50"
              min="1"
              hide-details
              label="Rounds"
              :disabled="!isGameAdmin"
            >
              <template v-slot:append>
                <v-text-field
                  v-model="rounds"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 50px"
                ></v-text-field>
              </template>
            </v-slider>
            
            <!-- Round duration -->
            <v-slider
              v-model="roundDuration"
              class="align-center"
              max="60"
              min="2"
              hide-details
              label="Round duration"
              :disabled="!isGameAdmin"
            >
              <template v-slot:append>
                <v-text-field
                  v-model="roundDuration"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 50px"
                  suffix="s"
                ></v-text-field>
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
    gameNumber: 0,
    players: [
      { id:0, name:'Jacques Chirac' },
      { id:1, name:'Valéry Giscard d\'Estaing' },
      { id:2, name:'Georges Pompidou' }
    ],
    maxPlayers: 30,
    rounds: 5,
    roundDuration: 10,
    isGameAdmin: false,
    gameStarting: false
  }),
  created () {
    if (this.$route.params.gameNumber === 'new') {
      // Create a new game and make this user admin
      // Faire la requête de création de partie, récupérer le numéro...

      this.isGameAdmin = true
    } else {
      // Join an existing game
      this.isGameAdmin = false
      this.gameNumber = this.$route.params.gameNumber
      
      let errorAlreadyStarted = false // True if the game is already started
      let errorNotExist = false // True if the game is already started
      // Faire la requête de rejoignage de la partie avec le numéro donné...

      if (errorAlreadyStarted || errorNotExist)
      {
        if (errorAlreadyStarted)
          alert('This game is already started.')
        else if (errorNotExist)
          alert('There is no game with the number you entered.')
        this.$router.push('/')
      }
      else
      {
        //
      }
    }
  },
  watch: {
    maxPlayers () {
      this.updateSettings()
    },
    rounds () {
      this.updateSettings()
    },
    roundDuration () {
      this.updateSettings()
    }
  },
  methods: {
    /**
     * Start the game and send all the players to the round page
     */
    startGame () {
      this.gameStarting = true

    },
    /**
     * Sends the new game settings to the server
     */
    updateSettings () {
      // Faire la requête qui envoie les nouveaux réglages au serveur pour les afficher chez les autres...
    }
  }
}
</script>
