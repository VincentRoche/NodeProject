<template>
  <v-container
    class="mt-12"
    fluid
    text-center
  >

    <v-row justify="center">
      <v-col md="8">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to EPIC JUSTE PRIX 3000
        </h1>
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
          <v-form>
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
            to="/lobby"
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
    joinLoading: false
  }),
  methods: {
    /**
     * Attempt to join game with the given number
     */
    joinGame () {
      this.joinLoading = true
      // Faire la requête...

      // Si c'est valide :
      this.$router.push(`/lobby/${this.gameNumber}`)
    }
  }
}
</script>
