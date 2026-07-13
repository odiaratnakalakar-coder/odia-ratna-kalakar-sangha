import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBuVQISkaKjflN7qQNy35hW7VVWIb-AL2Y",
  authDomain: "odia-ratna-kalakar-sangha.firebaseapp.com",
  projectId: "odia-ratna-kalakar-sangha",
  storageBucket: "odia-ratna-kalakar-sangha.firebasestorage.app",
  messagingSenderId: "462765943345",
  appId: "1:462765943345:web:167b7dd0eaba5786830310"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
