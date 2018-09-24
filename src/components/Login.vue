<template>
  <div class="container center-align" id="login">
    <div class="row">
      <form @submit.prevent="login" class="col s10 offset-s1 col m6 offset-m3">
        <div class="input-field">
          <input type="email" id="email" v-model="user.email">
          <label for="email">Email</label>
        </div>
        <div class="input-field">
          <input type="password" id="password" v-model="user.password">
          <label for="password">Password</label>
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      user: {}
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

</style>
