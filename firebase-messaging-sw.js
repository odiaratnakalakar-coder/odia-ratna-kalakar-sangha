importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBuVQISkaKjflN7qQNy35hW7VVWIb-AL2Y",
  authDomain: "odia-ratna-kalakar-sangha.firebaseapp.com",
  projectId: "odia-ratna-kalakar-sangha",
  storageBucket: "odia-ratna-kalakar-sangha.firebasestorage.app",
  messagingSenderId: "462765943345",
  appId: "1:462765943345:web:167b7dd0eaba5786830310"
});

const messaging = firebase.messaging();
