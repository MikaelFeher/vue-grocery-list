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
        <div class="row">
          <h5>Varor</h5>
          <hr class="col s12 col m6 offset-m3">
        </div>
        <draggable :element="'ul'" :list="groceries" :options="{ handle: '.handle' }" @change="updateOrder" class="row">
            <li v-if="!item.completed" v-for="item in groceries" :key="item['.key']" class="left-align black-text col s12 col m6 offset-m3">
              <span id="drag-handle-span"><i class="material-icons blue-grey-text handle">drag_handle</i></span>
              <p class="col s9 truncate" @click="setItemCompleted(item['.key'])">
                <b>{{ item.name }}</b>
              </p> 
              <span class="" id="edit-icon-span"><i class="material-icons blue-grey-text" @click="editItem(item)">edit</i></span>
              <span class="" id="delete-icon-span"><i class="material-icons red-text" @click="removeItem(item['.key'])">delete</i></span>
            </li>
        </draggable>
        <hr class="col s12 col m6 offset-m3">
      </div>

      <!-- All done notification -->
      <AllDone v-if="allCompleted" />
      
      <!-- List of completed groceries -->
      <div v-if="anyCompleted">
        <div class="row">
          <h5><em>Plockade Varor</em></h5>
          <hr class="col s12 col m6 offset-m3">
          <ul v-for="item in groceries" :key="item['.key']" class="">
            <li v-if="item.completed" class="center-align black-text col s12 col m6 offset-m3" @click="setItemNotCompleted(item['.key'])"> 
              <p class="col s12 truncate" id="completed-groceries-name"><b>{{ item.name }}</b></p> 
            </li>
          </ul>
          <hr class="col s12 col m6 offset-m3">
        </div>
        <button @click="clearCompleted" class="btn waves-effect waves-light amber darken-2" id="clear-completed-button">Rensa plockade varor</button>
      </div>
    </div>
    <LogoutButton v-if="!isLoading"  />
  </div>
</template>

<script>  
  import draggable from 'vuedraggable'
  import { dbGroceriesRef } from '../firebase/init.js'

  import LoadingScreen from './LoadingScreen.vue'
  import AllDone from './AllDone.vue'
  import AddItemForm from './AddItemForm.vue'
  import EditItemForm from './EditItemForm.vue'
  import LogoutButton from './LogoutButton.vue'

  export default {
    name: 'MainPage',
    components: {
      draggable,
      LoadingScreen,
      AllDone,
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
        updateOrderCount: 0
      }
    },
    created: async function() {
      this.updateOrder()
      this.checkCompleted()
    },
    updated: async function() {
      const editItemInput = document.getElementById('edit-item') || undefined
      if(editItemInput) editItemInput.focus()

      this.updateOrder()
      this.checkCompleted()
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
        this.checkCompleted()
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
        await dbGroceriesRef.child(key).update({ completed: true }).then(() => {
          return this.checkCompleted()
        }) 
      },
      setItemNotCompleted(key) {
        dbGroceriesRef.child(key).update({ completed: false })
          this.checkCompleted()
      },
      async updateOrder() {
        const updatedOrder = await this.groceries.reduce((acc, item) => acc.concat(Object.assign({}, item, {order : this.groceries.indexOf(item)})), [])
        await updatedOrder.map(async (item) => {
          return await dbGroceriesRef.child(item['.key']).update({ order: item.order })
        })
        this.checkCompleted()
      },
      removeItem(key) {
        dbGroceriesRef.child(key).remove()
        this.isEditing = false
        this.itemToEdit = ''
        this.checkCompleted()
      },
      checkCompleted() {
        if(!this.groceries && !this.isLoading) return this.allCompleted = true
        this.anyCompleted = this.checkIfAnyCompleted()
        this.allCompleted = this.checkIfAllCompleted()
      },
      checkIfAnyCompleted() {
        const completed = this.groceries.filter(item => item.completed)
        return !!completed.length
      },
      checkIfAllCompleted() {
        const notCompleted = this.groceries.filter(item => !item.completed)
        const allCompleted = notCompleted.length ? false : true
        return allCompleted
      },
      async clearCompleted() {
        const itemsToDelete = {}

        this.groceries.filter(item => item.completed)
          .map(item => itemsToDelete[item['.key']] = null)

        dbGroceriesRef.update(itemsToDelete)
        this.anyCompleted = false
      }
    }
  }

</script>

<style>

* {
  box-sizing: border-box;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  transition: all 3s ease-in-out;
}

ul li {
  position: relative;
}

li:active {
  cursor: grabbing;
}

li {
  text-transform: capitalize;
  line-height: 1.3em;
  padding: 2%;
  color: #fff;
  overflow: hidden;
  border: 1px solid black;
  opacity: 1;
  background: #fff;
}

li p {
  cursor: pointer;
  margin-left: 5% !important;
  padding-left: 1% !important;
}

#completed-groceries-name {
  margin-left: 0 !important;
  padding: 0;
}

i {
  padding: 0;
  cursor: pointer;
}

#groceries-list {
  margin: 3% 0;
}

#groceries-list p {
  margin-left: 2%;
}

#clear-completed-button {
  margin-bottom: 3%;
}

#loading-screen {
  margin-top: calc(100%/3);
}

#delete-icon-span {
  position: absolute;
  right: 0;
  top: 20%;
}

#edit-icon-span {
  position: absolute;
  right: 9%;
  top: 20%;
}

#drag-handle-span {
  position: absolute;
  top: 25%;
  left: 0;
}

.handle {
  cursor: grab;
}

.handle:active {
  cursor: grabbing;
}
</style>
