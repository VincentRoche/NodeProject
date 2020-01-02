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
                <v-toolbar-title>Log in</v-toolbar-title>
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
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn text to="/newAccount">Create an account</v-btn>
                <v-spacer />
                <v-btn color="primary" @click="tryToLogin" :loading="loading">Log in</v-btn>
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
      loading: false,
      errors: []
  }),
  methods: {
      async tryToLogin() {
        if (this.$refs.form.validate()) {
            this.loading = true
            
            const result = await this.axios.post('http://localhost:4000/log', {
                username: this.username,
                password: this.password
            })
                
            this.errors = []
            this.loading = false

            // If there are errors, display them
            if (result.data instanceof Array) {
                this.errors = result.data
            }
            else {
                // If successful, save session and redirect
                this.$store.commit('session/login', { sessionId: result.data, username: this.username })
                this.$router.push('/') // Back to the home page
            }
        }
      }
  }
}
</script>
