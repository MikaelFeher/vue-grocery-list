<template>
  <div id="app" class="container">
    <h3>Inköpslista</h3> 
    <router-view />
  </div>
</template>

<script>
  import MainPage from './components/MainPage.vue'

  export default {
    name: 'app',
    components: {
      MainPage
    }
  }
</script>

<style>

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 40px;
}


</style>
