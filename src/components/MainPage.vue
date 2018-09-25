<template>
  <div id="main-page" class="container center-align">

    <!-- Loading -->
    <LoadingScreen v-if="isLoading" />
    
    <!-- Not loading -->
    <div v-if="!isLoading">
      <div class="row">
    
        <!-- Add Item -->
        <AddItemForm 
          v-if="!isEditing" 
          v-on:itemToAdd="itemToAdd = $event"
          :addItem="addItem"
          :errorMsg="errorMsg"
        />
    
        <!-- Edit Item -->
        <EditItemForm 
          v-if="isEditing"
          v-on:cancel="isEditing = $event, errorMsg = ''"
          v-on:updateItem="updateItem"
          :updateItem="updateItem"
          :itemToEdit="itemToEdit"
          :errorMsg="errorMsg"
        />

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
      <AllDone v-if="allCompleted" />
      
      <!-- List of completed groceries -->
      <CompletedGroceriesList 
        v-if="anyCompleted"
        v-on:setItemNotCompleted="setItemNotCompleted($event)"
        :groceries="groceries"
        :clearCompleted="clearCompleted"  
      />

    </div>
    <LogoutButton v-if="!isLoading"  />
  </div>
</template>

<script>  
  import draggable from 'vuedraggable'
  import firebase from 'firebase'
  import { dbGroceriesRef } from '../firebase/init.js'

  import LoadingScreen from './LoadingScreen.vue'
  import AllDone from './AllDone.vue'
  import CompletedGroceriesList from './CompletedGroceriesList.vue'
  import AddItemForm from './AddItemForm.vue'
  import EditItemForm from './EditItemForm.vue'
  import LogoutButton from './LogoutButton.vue'



  export default {
    name: 'MainPage',
    components: {
      draggable,
      LoadingScreen,
      AllDone,
      CompletedGroceriesList,
      AddItemForm,
      EditItemForm,
      LogoutButton
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
      async editItem(item) {
        this.errorMsg = ''
        this.isEditing = true
        this.itemToEdit = Object.assign({}, item)
      },  
      async setItemCompleted(key) {
        dbGroceriesRef.child(key).update({ completed: true })
          .then(() => this.checkCompleted())
        
      },
      async setItemNotCompleted(key) {
        dbGroceriesRef.child(key).update({ completed: false })
          .then(() => this.checkCompleted())
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
