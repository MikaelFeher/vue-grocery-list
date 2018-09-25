<template>
  <div>
    <div class="row">
      <h5><em>Plockade Varor</em></h5>
      <hr class="col s12 col m6 offset-m3">
      <ul v-for="item in groceries" :key="item['.key']" class="col s12 col m6 offset-m3">
        <li v-if="item.completed" class="center-align black-text" @click="$emit('setItemNotCompleted', item['.key'])"> 
          <p class="col s12 truncate"><b>{{ item.name }}</b></p> 
        </li>
      </ul>
      <hr class="col s12 col m6 offset-m3">
    </div>
    <button @click="clearCompleted" class="btn waves-effect waves-light amber darken-2" id="clear-completed-button">Rensa plockade varor</button>
  </div>
</template>

<script>
  export default {
    name: 'CompletedGroceriesList',
    props: ['groceries', 'clearCompleted']
  }
</script>
