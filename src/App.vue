<template>
  <div id="app" class="container">
    <router-view />
  </div>
</template>

<script>
  import MainPage from './components/MainPage.vue'
  import { dbGroceriesRef } from './firebase/init.js'

  export default {
    name: 'app',
    components: {
      MainPage
    },
  }
</script>

<style>
@import "https://fonts.googleapis.com/icon?family=Material+Icons";

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 60px;
}

</style>
