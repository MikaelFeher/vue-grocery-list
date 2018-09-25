<template>
  <form @submit.prevent class="col s12 col m6 offset-m3">
    <div class="input-field">
      <label for="edit-item">Redigera vara</label>
      <input type="text" id="edit-item" v-model="itemToEdit.name" class="center-align">
    </div>
    <h6 v-if="errorMsg.length" class="card-panel red white-text"><b>{{ errorMsg }}</b></h6>
    <button type="submit" @click="$emit('updateItem')" class="btn waves-effect waves-light green col s5 offset-s1">Uppdatera</button>
    <button type="button" @click="$emit('cancel', false)" class="btn waves-effect waves-light red col s4 offset-s1">Avbryt</button>
  </form>
</template>

<script>
export default {
  name: 'EditItemForm',
  props: ['updateItem', 'itemToEdit', 'errorMsg']
}
</script>
