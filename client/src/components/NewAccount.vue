<template>
  <v-container
    class="fill-height"
    fluid
    >
    <v-row
        align="center"
        justify="center"
    >
        <v-col
        cols="12"
        sm="8"
        md="4"
        >
        <v-card class="elevation-12">
            <v-toolbar
            color="primary"
            dark
            flat
            >
                <v-toolbar-title>New account</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-form>
                    <v-text-field
                    label="Username"
                    name="username"
                    prepend-icon="mdi-account"
                    type="text"
                    />

                    <v-text-field
                    id="password"
                    label="Password"
                    name="password"
                    prepend-icon="mdi-lock"
                    type="password"
                    />

                    <v-text-field
                    id="passwordConfirm"
                    label="Confirm password"
                    name="passwordConfirm"
                    prepend-icon="mdi-lock"
                    type="password"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn text to="/login">Use an existing account</v-btn>
                <v-spacer />
                <v-btn color="primary" @click="submitNewAccount" :loading="loading">Create account</v-btn>
            </v-card-actions>
        </v-card>
        </v-col>
    </v-row>
    </v-container>
</template>

<script>
export default {
  data: () => ({
      loading: false
  }),
  created () {
    // Redirect to home page if already logged in
    if (this.$store.getters['session/isLoggedIn'])
        this.$router.push('/')
  },
  methods: {
    submitNewAccount() {
        this.loading = true
        // Faire la requête...

        // Si c'est valide :
        this.$store.commit('session/login', 1, { username: 'TEST' })
        //this.$router.push('/')
    }
  }
}
</script>
