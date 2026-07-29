import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("Trust Accounts Loaded");async function loadDashboard() {
  try {
    const memberSnap = await getDocs(collection(db, "members"));

    document.getElementById("members").textContent = memberSnap.size;

    console.log("Members:", memberSnap.size);

  } catch (error) {
    console.error("Firestore Error:", error);
    alert(error.message);
  }
}

loadDashboard();
