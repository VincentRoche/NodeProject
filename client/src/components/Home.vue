<template>
  <v-container
    class="mt-6"
    fluid
    text-center
  >

    <v-row justify="center">
      <v-col md="8">
        <v-img src="@/assets/lagaf.jpg" max-height="400" contain></v-img>
      </v-col>
    </v-row>

    <template v-if="!this.$store.getters['session/isLoggedIn']">
      <v-row justify="center">
        <v-col sm="4" lg="2">
          <v-btn large block color="primary" to="/login">Log in</v-btn>
        </v-col>
        <v-col sm="4" lg="2">
          <v-btn large block color="primary" to="/newAccount">Create an account</v-btn>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row justify="center">
        <v-col sm="6" md="4" lg="2">
          <p class="font-weight-medium">Join a game:</p>
          <v-alert type="error" v-if="$route.query.error">{{ errors[$route.query.error] }}</v-alert>
          <v-form @submit="joinGame">
            <v-text-field
              v-model="gameNumber"
              label="Game number"
              solo
              required
              type="number"
              :disabled="joinLoading"
            >
              <template v-slot:append>
                <v-btn 
                  color="primary" 
                  fab
                  small
                  @click="joinGame"
                  :loading="joinLoading"
                >
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-form>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col>
          <v-btn
            to="/lobby/new"
            :disabled="joinLoading"
          >
            Create a game
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    gameNumber: '',
    joinLoading: false,
    errors: {
      errorGameFull: 'Sorry, this game is full.',
      errorNotExist: 'There is no game with the number you entered.',
      errorAlreadyStarted: 'This game is already started.'
    }
  }),
  methods: {
    /**
     * Attempt to join game with the given number
     */
    joinGame () {
      this.joinLoading = true
      this.$router.push(`/lobby/${this.gameNumber}`)
    }
  }
}
</script>
