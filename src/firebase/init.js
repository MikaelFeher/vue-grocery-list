import firebase from 'firebase'
import firestore from 'firebase/firestore'

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAaEdbCSaLt4T2NpUnKF_Y8NWIKUTViSIc",
  authDomain: "vue-grocery-list.firebaseapp.com",
  databaseURL: "https://vue-grocery-list.firebaseio.com",
  projectId: "vue-grocery-list",
  storageBucket: "vue-grocery-list.appspot.com",
  messagingSenderId: "832275443507"
}

const firebaseApp = firebase.initializeApp(config)
firebaseApp.firestore().settings({ timestampsInSnapshots: true })

export default firebaseApp.firestore()