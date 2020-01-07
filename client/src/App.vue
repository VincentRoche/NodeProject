<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-toolbar-title><router-link to="/" style="text-decoration: none; color: white">Le Juste Prix</router-link></v-toolbar-title>

      <v-spacer></v-spacer>

      <span class="mr-2">{{ $store.state.session.username }}</span>

      <v-btn text v-if="$store.getters['session/isLoggedIn']" @click="logout">
        <span class="mr-2">Log out</span>
        <v-icon>mdi-door</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    //
  }),
  methods: {
    async logout () {
      await this.axios.post(process.env.NODE_ENV === 'development' ? 'http://localhost:3000/logout' : '/logout', {
          sessionId: this.$store.state.session.sessionId
      })
      this.$store.commit('session/logout')
      this.$router.push('/')
    }
  }
};
</script>
