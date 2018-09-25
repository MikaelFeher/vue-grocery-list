<template>
  <div class="container center-align" id="login">
    <div class="row">
      <form @submit.prevent="login" class="col s10 offset-s1 col m6 offset-m3">
        <div class="input-field">
          <i class="material-icons prefix">email</i>
          <input type="email" id="email" v-model="email">
          <label for="email">Email</label>
        </div>
        <div class="input-field">
          <i class="material-icons prefix">lock</i>
          <input type="password" id="password" v-model="password">
          <label for="password">Password</label>
        </div>
        <button type="submit" class="btn waves-effect waves-light green">Log In</button>
      </form>
    </div>
    <div v-if="errorMsg.length" class="row" id="error-alert">
      <h6 class="card-panel red white-text col s10 offset-s1"><b>{{ errorMsg }}</b></h6>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      errorMsg: ''
    }
  },
  methods: {
    login() {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then(() => {
          this.$router.replace('/index.html')
          this.errorMsg = ''
        })
        .catch(error => this.errorMsg = error.message)
    }
  }
}
</script>

<style scoped>
  #login {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* text-align: center; */
    color: #2c3e50;
    margin-top: 100px;
  }

  h6 {
    line-height: 2em;
  }

</style>