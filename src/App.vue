<template>
  <div id="app" class="container">
    <div class="row">
      <!-- Add Item -->
      <form v-if="!isEditing" @submit.prevent="addItem" class="col s12 col m6 offset-m3">
        <div class="input-field">
          <label for="add-item">Lägg till vara</label>
          <input type="text" id="add-item" v-model="itemToAdd" class="center-align">
        </div>
        <h6 v-if="errorMsg.length" class="card-panel red white-text"><b>{{ errorMsg }}</b></h6>
        <button type="submit" class="btn waves-effect waves-light green">Lägg till vara</button>
      </form>
      <!-- Edit Item -->
      <form v-if="isEditing" @submit.prevent="updateItem" class="col s12 col m6 offset-m3">
        <div class="input-field">
          <label for="edit-item">Redigera vara</label>
          <input type="text" id="edit-item" v-model="itemToEdit.name" class="center-align">
        </div>
        <h6 v-if="errorMsg.length" class="card-panel red white-text"><b>{{ errorMsg }}</b></h6>
        <button type="submit" class="btn waves-effect waves-light green">Uppdatera varan</button>
      </form>
    </div>
    groceries: {{ groceries.length }}
    completedGroceries: {{ completedGroceries.length }}
    <div v-if="!allCompleted" class="row">
      <h5>Varor</h5>
      <hr class="col s12 col m6 offset-m3">
      <draggable v-model="groceries" @change="updateOrder">
        <transition-group>
          <ul v-if="groceries.length !== 0" v-for="item in groceries" :key="item['.key']" class="col s12 col m6 offset-m3">
            <li v-if="!item.completed" class="left-align black-text "> 
              <p class="col s10 truncate" @click="setItemCompleted(item._id)"><b>{{ item.name }}</b></p> 
              <i class="material-icons col s1 blue-grey-text" @click="editItem(item)">edit</i>
              <i class="material-icons col s1 red-text" @click="removeItem(item['.key'])">delete</i>
            </li>
          </ul>
        </transition-group>
      </draggable>
      <hr class="col s12 col m6 offset-m3">
    </div>
    <div v-if="allCompleted" class="row">
      <div class="col s12 col m6 offset-m3 green">
        <h4 class="white-text">Du är klar :)))</h4>
      </div>
    </div>
    <div v-if="completedGroceries.length !== 0" >
      <div class="row">
        <h5>Plockade varor</h5>
        <hr class="col s12 col m6 offset-m3">
        <ul v-for="item in completedGroceries" :key="item._id" class="col s12 col m6 offset-m3">
          <li class="center-align black-text" @click="setItemNotCompleted(item._id)"> 
            <p class="col s12 truncate">{{ item.name }}</p> 
          </li>
        </ul>
        <hr class="col s12 col m6 offset-m3">
      </div>
      <button @click="clearCompleted" class="btn waves-effect waves-light red" id="clear-completed-button">Rensa plockade varor</button>
    </div>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import { dbGroceriesRef, dbCompletedGroceriesRef } from './firebase/init.js'

  export default {
    name: 'app',
    components: {
      draggable
    },
    data() {
      return {
        itemToAdd: '',
        completedGroceries: [],
        allCompleted: false,
        itemToEdit: {},
        isEditing: false,
        errorMsg: ''
      }
    },
    created: function() {
      this.groceries.map(item => console.log('item.name: ', item.name))
      
    },
    updated: async function() {
      const editItemInput = document.getElementById('edit-item') || undefined
      if(editItemInput) editItemInput.focus()

      // await this.checkIfAllCompleted()
      // const addItemInput = document.getElementById('add-item') || undefined
      // addItemInput ? addItemInput.focus() : editItemInput.focus()
      
    },
    firebase: {
      groceries: dbGroceriesRef.orderByChild('order'),
      completedGroceries: dbCompletedGroceriesRef
    },
    methods: {
      async updateItem() {
        if(await this.inputNotOk(this.itemToEdit.name)) return
        dbGroceriesRef.child(this.itemToEdit['.key']).update({ name: this.itemToEdit.name })
        this.isEditing = false
        this.itemToEdit = {}
      },
      async addItem() {
        if(await this.inputNotOk(this.itemToAdd)) return
        dbGroceriesRef.push({
          order: this.groceries.length, 
          name: this.itemToAdd.toLowerCase(), 
          completed: false 
        })
        this.itemToAdd = ''
        document.getElementById('add-item').focus()
      },
      async inputNotOk(name) {
        if(this.nameTooShort(name)) {
          this.errorMsg = 'Måste innehålla minst 2 tecken...'
          return true
        }
        if(await this.nameExists(name)) {
          this.errorMsg = 'Finns redan en vara med det namnet...'
          return true
        }
        this.errorMsg = ''
        return false
      },
      nameTooShort(name) {
        return name.length < 2
      },
      async nameExists(name) {
        const exists = await this.groceries.filter(item => item.name === name)
        return !!exists.length
      },
      async setItemCompleted(id) {
        //TODO
        this.groceries = this.groceries.reduce((acc, item) => 
          item._id === id ? 
          acc.concat(Object.assign({}, item, {completed: true})) : 
          acc.concat(item),[]
        )
        await this.updateOrder()
        
      },
      async setItemNotCompleted(id) {
        //TODO
        this.groceries = this.groceries.reduce((acc, item) => 
          item._id === id ? 
          acc.concat(Object.assign({}, item, {completed: false})) : 
          acc.concat(item),[]
        )
        await this.updateOrder()
        
      },
      async editItem(item) {
        this.isEditing = true
        this.itemToEdit = Object.assign({}, item)
      },
      async updateOrder() {
        return await this.groceries.map(item => dbGroceriesRef.child(item['.key']).update({ order: this.groceries.indexOf(item) }))
      },
      removeItem(key) {
        dbGroceriesRef.child(key).remove()
        this.updateOrder()
      },
      async checkIfAllCompleted() {
        //TODO: CHeck if this works properly
        const notCompleted = await this.groceries.filter(item => !item.completed)
        this.allCompleted = notCompleted.length === 0
      },
      clearCompleted() {
        //TODO
        this.completedGroceries = []
        this.groceries = this.groceries.filter(item => !item.completed )
        this.updateOrder()
      }
    }
  }

  /***************** Firebase functions *****************/
  // dbGroceriesRef.on('value', snap => groceries = snap.val())
  /******************************************************/
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
li:active {
  cursor: grabbing;
}
li {
  text-transform: capitalize;
  cursor: grab;
  margin: 0;
  padding: 0;
  /* background: #d1703c; */
  color: #fff;
  /* padding: 1%; */
  overflow: hidden;
  /* margin-bottom: 2%; */
  /* border-bottom: 1px solid black;
  border-right: 1px solid black; */
  /* border: 1px solid black; */
  /* box-shadow: 0 0 15px 0 #333; */
  border-radius: 3px;
}
li p {
  cursor: pointer;
}
li p:active {
  cursor: grabbing;
}
i {
  margin: 3% auto;
  cursor: pointer;
}

#clear-completed-button {
  margin-bottom: 3%;
}


</style>
