<template>
  <div id="app" class="container">
    <div class="row">
      <form @submit.prevent="addItem" class="col s12 col m6 offset-m3">
        <div v-if="isEditing" class="input-field">
          <input type="text" id="edit-item" v-model="itemToEdit.name" class="center-align">
          <label for="edit-item">Redigera vara</label>
        </div>
        <div v-else class="input-field">
          <input type="text" id="add-item" v-model="itemToAdd" class="center-align">
          <label for="add-item">Lägg till vara</label>
        </div>
        <button type="submit" class="btn waves-effect waves-light green">{{ isEditing ? 'Uppdatera' : 'Lägg till'}} <i class="material-icons right">send</i></button>
      </form>
    </div>
    <div class="row">
      <draggable v-model="groceries" @change="updateOrder">
        <transition-group>
          <ul v-if="groceries.length !== 0" v-for="item in groceries" :key="item._id" class="col s12 col m6 offset-m3">
            <li v-if="!item.completed" class="left-align"> 
              <h5 class="col s9" @click="setItemCompleted(item._id)"> {{item.order}} {{ item.name }}</h5> 
              <i class="material-icons col s1" @click="editItem(item._id)">edit</i>
              <i class="material-icons col s1" @click="removeItem(item._id)">delete</i>
            </li>
          </ul>
        </transition-group>
      </draggable>
    </div>
    <div v-if="completedGroceries.length !== 0" >
      <div class="row">
        <h4>Plockade varor</h4>
        <ul v-for="item in completedGroceries" :key="item._id" class="col s12 col m6 offset-m3">
          <li class="left-align"> 
            <h5 class="col s9" @click="setItemNotCompleted(item._id)">{{ item.name }}</h5> 
          </li>
        </ul>
      </div>
      <button @click="clearCompleted" class="btn waves-effect waves-light red">Rensa plockade varor</button>
    </div>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'

  export default {
    name: 'app',
    components: {
      draggable
    },
    data() {
      return {
        itemToAdd: '',
        groceries: [
          { _id: 1, order: 0, name: 'mjölk', completed: false },
          { _id: 2, order: 1, name: 'bröd', completed: false },
          { _id: 3, order: 2, name: 'potatis', completed: false },
        ],
        notCompletedGroceries: [],
        completedGroceries: [],
        itemToEdit: {},
        isEditing: false
      }
    },
    created: function() {
      this.populateLists()
    },
    methods: {
      async populateLists() {
        this.completedGroceries = await this.groceries.filter(item => item.completed)
      },
      async addItem() {
        if(this.isEditing) {
          this.groceries = this.groceries.reduce((acc, item) => 
            item._id === this.itemToEdit._id ? 
            acc.concat(Object.assign({}, item, this.itemToEdit)) : 
            acc.concat(item), []
          )
          this.itemToEdit = {}
          this.isEditing = false
          return
        }
        const nameExists = await this.itemNameExists(this.itemToAdd)
        if(nameExists) return
        const newId = await this.createId()
        this.groceries = this.groceries.concat({ _id: newId, order: this.groceries.length, name: this.itemToAdd.toLowerCase(), completed: false })
        this.itemToAdd = '';
      },
      async createId() {
        const id = Math.floor(Math.random() * 99999)
        const exist = await this.groceries.filter(item => item._id === id)
        return !!exist.length ? this.createId() : id
      },
      async itemNameExists(name) {
        const exists = await this.groceries.filter(item => item.name === name)
        return !!exists.length
      },
      async setItemCompleted(id) {
        this.groceries = this.groceries.reduce((acc, item) => 
          item._id === id ? 
          acc.concat(Object.assign({}, item, {completed: true})) : 
          acc.concat(item),[]
        )
        await this.updateOrder()
        this.populateLists()
      },
      async setItemNotCompleted(id) {
        this.groceries = this.groceries.reduce((acc, item) => 
          item._id === id ? 
          acc.concat(Object.assign({}, item, {completed: false})) : 
          acc.concat(item),[]
        )
        await this.updateOrder()
        this.populateLists()
      },
      async editItem(id) {
        this.isEditing = true
        const itemToEdit = await this.groceries.filter(item => item._id === id)[0]
        this.itemToEdit = Object.assign({}, itemToEdit)
      },
      async updateOrder() {
        return this.groceries = await this.groceries.reduce((acc, item) => 
          acc.concat(Object.assign({}, item, { order: this.groceries.indexOf(item) })), [])
      },
      removeItem(id) {
        return this.groceries = this.groceries.filter(item => item._id !== id)
        this.updateOrder()
      },
      clearCompleted() {
        this.completedGroceries = []
        this.groceries = this.groceries.filter(item => !item.completed )
        this.updateOrder()
      }
    }
  }
</script>

<style>
@import "https://fonts.googleapis.com/icon?family=Material+Icons";

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
ul {
  list-style-type: none;
  margin: 0;
}

#item-name {
}
#li:active {
  cursor: grabbing;
}
li {
  text-transform: capitalize;
  cursor: grab;
  background: #d1703c;
  color: #fff;
  /* padding: 1%; */
  overflow: hidden;
  margin-bottom: 1%;
  transition: all 1.5s ease-in-out;
}
i {
  margin: 3% auto;
  cursor: pointer;
}


</style>
