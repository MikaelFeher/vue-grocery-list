<template>
  <div class="row">
    <div class="col s6 offset-s3">
      <button @click="logout" class="waves-effect waves-light btn red">Logga Ut</button>
    </div>
  </div>
</template>

<script>
  import firebase from 'firebase'

  export default {
    name: 'LogoutButton',
    methods: {
      logout() {
        firebase.auth().signOut().then(() => this.$router.replace('/login'))
      }
    }
  }
</script>
