<template>
  <form @submit.prevent="addItem" class="col s12 col m6 offset-m3">
    <div class="input-field">
      <label for="add-item">Lägg till vara</label>
      <input type="text" id="add-item" v-model="newItem" class="center-align" autocomplete="off">
    </div>
    <h6 v-if="errorMsg.length" class="card-panel red white-text"><b>{{ errorMsg }}</b></h6>
    <button type="submit" @click="sendAndClearInput" class="btn waves-effect waves-light green">Lägg till vara</button>
  </form>
</template>

<script>
export default {
  name: 'EditItemForm',
  props: ['addItem', 'errorMsg'],
  data() {
    return {
      newItem: ''
    }
  },
  methods: {
    sendAndClearInput() {
      this.$emit('itemToAdd', this.newItem)
      this.newItem = ''
    }
  }
}
</script>
