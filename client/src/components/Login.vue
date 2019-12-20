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
                <v-form>
                    <v-text-field
                    label="Username"
                    name="username"
                    prepend-icon="mdi-account"
                    type="text"
                    v-model="username"
                    />

                    <v-text-field
                    id="password"
                    label="Password"
                    name="password"
                    prepend-icon="mdi-lock"
                    type="password"
                    v-model="password"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn text to="/newAccount">Create an account</v-btn>
                <v-spacer />
                <v-btn color="primary" @click="tryToLogin">Log in</v-btn>
            </v-card-actions>
        </v-card>
        </v-col>
    </v-row>
    </v-container>
</template>

<script>
export default {
  data: () => ({
  }),
  methods: {
      tryToLogin() {
        // Cette requête pour se connecter te renvoie les messages suivants :
        // Soit une erreur liée au schema mongoose genre 'Username must not be empty.'
        // Soit 'User doesn't exist.'
        // Soit 'User logged in.'
        // Faut passer à la suite seulement si tu reçois 'User logged in.'
        // messages présents dans res.data
        // En sachant qu'à chaque fois je te renvoie un tableau de string
        // parce que tu peux avoir plusieurs erreurs en même temps
        // donc si tu veux tu peux faire une sorte de 'liste' à afficher à côté
        this.axios.post('http://localhost:4000/log', {
                    username: this.username,
                    password: this.password
                })
                .then(function (res) {
                    alert(res.data)
                })
      }
  }
};
</script>
