import { initializeApp } from 'firebase'

// Initialize Firebase
const app = initializeApp({
  apiKey: "AIzaSyAaEdbCSaLt4T2NpUnKF_Y8NWIKUTViSIc",
  authDomain: "vue-grocery-list.firebaseapp.com",
  databaseURL: "https://vue-grocery-list.firebaseio.com",
  projectId: "vue-grocery-list",
  storageBucket: "vue-grocery-list.appspot.com",
  messagingSenderId: "832275443507"
})

const db = app.database();

const dbGroceriesRef = db.ref('groceries')
const dbCompletedGroceriesRef = db.ref('completedGroceries')
// const dbNewGrocerieRef = dbGroceriesRef.push()

export {
  dbGroceriesRef,
  dbCompletedGroceriesRef
};