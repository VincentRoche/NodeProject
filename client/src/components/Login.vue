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
                    />

                    <v-text-field
                    id="password"
                    label="Password"
                    name="password"
                    prepend-icon="mdi-lock"
                    type="password"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn text to="/newAccount">Create an account</v-btn>
                <v-spacer />
                <v-btn color="primary">Log in</v-btn>
            </v-card-actions>
        </v-card>
        </v-col>
    </v-row>
    </v-container>
</template>

<script>
export default {
  name: 'Home',

  data: () => ({
  }),
};
</script>
