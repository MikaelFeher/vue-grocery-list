<template>
  <div id="main-page" class="container center-align">
    <!-- Loading -->
    <div v-if="isLoading" class="row" id="loading-screen">
      <div class="col s10 offset-s1 col m4 offset-m4">
        <h5>Hämtar listan...</h5>
        <div class="progress">
          <div class="indeterminate"></div>
        </div>
      </div>
    </div>
    <!-- Not loading -->
    <div v-if="!isLoading">
      <div class="row">
        <!-- Add Item -->
        <form v-if="!isEditing" @submit.prevent="addItem" class="col s12 col m6 offset-m3">
          <div class="input-field">
            <label for="add-item">Lägg till vara</label>
            <input type="text" id="add-item" v-model="itemToAdd" class="center-align" autocomplete="off">
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
      <!-- List of not completed groceries -->
      <div v-if="!allCompleted" class="row" id="groceries-list">
        <h5>Varor</h5>
        <hr class="col s12 col m6 offset-m3">
        <draggable v-model="groceries" @change="updateOrder">
          <transition-group>
            <ul v-for="item in groceries" :key="item['.key']" class="col s12 col m6 offset-m3">
              <li v-if="!item.completed" class="left-align black-text"> 
                <p class="col s9 truncate" @click="setItemCompleted(item['.key'])"><b>{{ item.name }}</b></p> 
                <i class="material-icons col s1 col m1 blue-grey-text" @click="editItem(item)">edit</i>
                <i class="material-icons col s1 col m1 red-text" @click="removeItem(item['.key'])">delete</i>
              </li>
            </ul>
          </transition-group>
        </draggable>
        <hr class="col s12 col m6 offset-m3">
      </div>
      <!-- All done notification -->
      <div v-if="allCompleted" class="row">
        <div class="col s12 col m6 offset-m3 green">
          <h4 class="white-text">Du är klar :)))</h4>
        </div>
      </div>
      <!-- List of completed groceries -->
      <div v-if="anyCompleted" >
        <div class="row">
          <h5><em>Plockade Varor</em></h5>
          <hr class="col s12 col m6 offset-m3">
          <ul v-for="item in groceries" :key="item['.key']" class="col s12 col m6 offset-m3">
            <li v-if="item.completed" class="center-align black-text" @click="setItemNotCompleted(item['.key'])"> 
              <p class="col s12 truncate"><b>{{ item.name }}</b></p> 
            </li>
          </ul>
          <hr class="col s12 col m6 offset-m3">
        </div>
        <button @click="clearCompleted" class="btn waves-effect waves-light amber darken-2" id="clear-completed-button">Rensa plockade varor</button>
      </div>
    </div>
    <div class="row">
      <div class="col s6 offset-s3">
        <button v-if="!isLoading" @click="logout" class="waves-effect waves-light btn red">Logga Ut</button>
      </div>
    </div>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import firebase from 'firebase'
  import { dbGroceriesRef } from '../firebase/init.js'

  export default {
    name: 'MainPage',
    components: {
      draggable
    },
    data() {
      return {
        itemToAdd: '',
        anyCompleted: false,
        allCompleted: false,
        isLoading: true,
        itemToEdit: {},
        isEditing: false,
        errorMsg: '',
        currentUser: firebase.auth().currentUser

      }
    },
    created: async function() {
    },
    updated: async function() {
      const editItemInput = document.getElementById('edit-item') || undefined
      if(editItemInput) editItemInput.focus()

      await this.checkCompleted()
    },
    firebase: {
      groceries: {
        source: dbGroceriesRef.orderByChild('order'),
        readyCallback: function() {
          this.isLoading = false
        }
      }
    },
    methods: {
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
      async updateItem() {
        if(await this.inputNotOk(this.itemToEdit.name)) return
        dbGroceriesRef.child(this.itemToEdit['.key']).update({ name: this.itemToEdit.name })
        this.isEditing = false
        this.itemToEdit = {}
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
      async setItemCompleted(key) {
        dbGroceriesRef.child(key).update({ completed: true })
      },
      async setItemNotCompleted(key) {
        dbGroceriesRef.child(key).update({ completed: false })
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
        this.isEditing = false
        this.itemToEdit = ''
      },
      async checkCompleted() {
        if(!this.groceries && !this.isLoading) return this.allCompleted = true
        this.anyCompleted = await this.checkIfAnyCompleted()
        this.allCompleted = await this.checkIfAllCompleted()
      },
      async checkIfAnyCompleted() {
        const completed = await this.groceries.filter(item => item.completed)
        return !!completed.length
      },
      async checkIfAllCompleted() {
        const notCompleted = await this.groceries.filter(item => !item.completed)
        const allCompleted = notCompleted.length ? false : true
        return allCompleted
      },
      async clearCompleted() {
        const itemsToDelete = {}
        const completed = await this.groceries.filter(item => item.completed)
          .map(item => itemsToDelete[item['.key']] = null)
        dbGroceriesRef.update(itemsToDelete)
        this.anyCompleted = false
      },
       logout() {
        firebase.auth().signOut().then(() => this.$router.replace('/login'))
      }
    }
  }

</script>

<style>

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
li:active {
  cursor: grabbing;
}
li {
  text-transform: capitalize;
  cursor: grab;
  margin: 0;
  padding: 0;
  color: #fff;
  overflow: hidden;
  border-radius: 3px;
}
li p {
  cursor: pointer;
}
li p:active {
  cursor: grabbing;
}
i {
  margin: 3%;
  cursor: pointer;
}

#groceries-list {
  margin-bottom: 3%;
}

#clear-completed-button {
  margin-bottom: 3%;
}

#loading-screen {
  margin-top: calc(100%/3);
}

</style>
