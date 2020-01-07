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
                <v-form
                    ref="form"
                    v-model="valid"
                >
                    <v-alert type="error" v-if="errors.length">{{ errors.join(' ') }}</v-alert>
                    <v-text-field
                        label="Username"
                        name="username"
                        prepend-icon="mdi-account"
                        type="text"
                        v-model="username"
                        :rules="usernameRules"
                    />

                    <v-text-field
                        id="password"
                        label="Password"
                        name="password"
                        prepend-icon="mdi-lock"
                        type="password"
                        v-model="password"
                        :rules="passwordRules"
                    />

                    <v-text-field
                        id="passwordConfirm"
                        label="Confirm password"
                        name="passwordConfirm"
                        prepend-icon="mdi-lock"
                        type="password"
                        v-model="passwordVerif"
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
      valid: true,
      username: '',
      usernameRules: [
        v => !!v || 'Username is required'
      ],
      password: '',
      passwordRules: [
        v => !!v || 'Password is required'
      ],
      passwordVerif: '',
      loading: false,
      errors: []
  }),
  created () {
    // Redirect to home page if already logged in
    if (this.$store.getters['session/isLoggedIn'])
        this.$router.push('/')
  },
  methods: {
    async submitNewAccount() {
        if (this.$refs.form.validate()) {
            // Error if the two passwords do not match
            if (this.password !== this.passwordVerif) {
                this.errors.push('The two passwords do not match.')
            } else {
                this.loading = true
                // Faire la requête...
                // Cette requête te renvoie soit les erreurs par rapport au schéma Mongoose
                // donc 'Username must not be empty.' et des trucs du genre
                // soit il te renvoie 'Username already taken.'
                // soit 'User saved.'
                // Le but du coup c'est de passer à la suite seulement si tu as reçu
                // 'User saved.' et c'est ce que tu as dans res.data
                // En sachant qu'à chaque fois je te renvoie un tableau de string
                // parce que tu peux avoir plusieurs erreurs en même temps
                // donc si tu veux tu peux faire une sorte de 'liste' à afficher à côté
                const result = await this.axios.post(process.env.NODE_ENV === 'development' ? 'http://localhost:3000/acc' : '/acc', {
                    username: this.username,
                    password: this.password
                })

                this.errors = []
                this.loading = false

                // If there are errors, display them
                if (result.data instanceof Array) {
                    this.errors = result.data
                } else {
                    // If the account was created, log in and redirect
                    this.$store.commit('session/login', { sessionId: result.data, username: this.username }) // TODO: Mettre le numéro de session renvoyé par la requête d'avant
                    this.$router.push('/') // Back to the home page
                }
            }
        }
    }
  }
}
</script>
