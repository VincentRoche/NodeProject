<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >

      <v-flex mb-4>
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to EPIC JUSTE PRIX 3000
        </h1>
        <div class="my-2">
          <v-btn large color="primary">Log in</v-btn>
        </div>
        <div class="my-2">
          <v-btn large color="primary" to="/newAccount">Create an account</v-btn>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Home',

  data: () => ({
  }),
};
</script>
